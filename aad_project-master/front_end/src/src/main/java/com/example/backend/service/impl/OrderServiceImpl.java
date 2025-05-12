package com.example.backend.service.impl;

import com.example.backend.dto.OrderDTO;
import com.example.backend.dto.OrderItemDTO;
import com.example.backend.entity.*;
import com.example.backend.exception.BadRequestException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.*;
import com.example.backend.service.CartService;
import com.example.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.*;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderServiceImpl implements OrderService {

    /* ──────────────────────────── repositories & helpers ─────────────────────────── */

    @Autowired private OrderRepository        orderRepository;
    @Autowired private OrderItemRepository    orderItemRepository;
    @Autowired private CartRepository         cartRepository;
    @Autowired private CartItemRepository     cartItemRepository;
    @Autowired private ProductRepository      productRepository;
    @Autowired private ProductImageRepository productImageRepository;
    @Autowired private CartService            cartService;

    /* ──────────────────────────── basic CRUD / queries ─────────────────────────── */

    @Override
    public List<OrderDTO> findAllOrders() {
        return orderRepository.findAll()
                              .stream()
                              .map(this::mapOrderToDTO)
                              .toList();
    }

    @Override
    public List<OrderDTO> findByUserId(Long id) {
        return orderRepository.findByUserId(id)
                              .stream()
                              .map(this::mapOrderToDTO)
                              .toList();
    }

    @Override
    public List<OrderDTO> findUserOrders(Authentication auth) {
        User current = (User) auth.getPrincipal();
        return orderRepository.findByUserOrderByOrderDateDesc(current)
                              .stream()
                              .map(this::mapOrderToDTO)
                              .toList();
    }

    @Override
    public List<OrderDTO> findSellerOrders(Authentication auth) {
        User seller = (User) auth.getPrincipal();
        return orderRepository.findAll()
                              .stream()
                              .filter(o -> o.getItems()
                                            .stream()
                                            .anyMatch(i -> i.getStore()
                                                            .getSeller()
                                                            .getId()
                                                            .equals(seller.getId())))
                              .map(this::mapOrderToDTO)
                              .toList();
    }

    @Override
    public OrderDTO findById(Long id) {
        Order order = orderRepository.findById(id)
                                     .orElseThrow(() ->
                                          new ResourceNotFoundException("Order not found id=" + id));
        return mapOrderToDTO(order);
    }

    /* ──────────────────────────── create / update / delete ─────────────────────────── */

    @Override
    @Transactional
    public OrderDTO createOrder(OrderDTO dto, Authentication auth) {
        User current = (User) auth.getPrincipal();

        Cart cart = cartRepository.findByUser(current)
                                  .orElseThrow(() -> new BadRequestException("Cart is empty"));
        List<CartItem> cartItems = cartItemRepository.findByCart(cart);
        if (cartItems.isEmpty()) throw new BadRequestException("Cart is empty");

        Order order = new Order();
        order.setUser(current);
        order.setShipmentStatus("PENDING");
        order = orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            if (p.getStockQuantity() < ci.getQuantity()) {
                throw new BadRequestException("Not enough stock: " + p.getName());
            }
            p.setStockQuantity(p.getStockQuantity() - ci.getQuantity());
            productRepository.save(p);

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            oi.setQuantity(ci.getQuantity());
            oi.setPrice(p.getPrice());
            oi.setStore(p.getStore());
            oi = orderItemRepository.save(oi);
            orderItems.add(oi);

            total = total.add(p.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
        }

        order.setTotalAmount(total);
        order.setItems(orderItems);
        order = orderRepository.save(order);

        // Don't clear cart items here, just remove the cart items
        for (CartItem item : cartItems) {
            cartItemRepository.delete(item);
        }
        
        return mapOrderToDTO(order);
    }

    @Override
    @Transactional
    public OrderDTO updateOrderStatus(Long id, String status, Authentication auth) {
        Order order = orderRepository.findById(id)
                                     .orElseThrow(() -> new ResourceNotFoundException("Order not found id=" + id));

        User user = (User) auth.getPrincipal();

        if (user.getRole() == Role.SELLER) {
            boolean ok = order.getItems().stream()
                              .anyMatch(i -> i.getStore().getSeller().getId().equals(user.getId()));
            if (!ok) throw new AccessDeniedException("Not your order");
        } else if (user.getRole() != Role.PLATFORM_ADMIN) {
            if (!order.getUser().getId().equals(user.getId()))
                throw new AccessDeniedException("Not your order");
            if (!"CANCELLED".equals(status))
                throw new AccessDeniedException("You may only cancel your orders");
        }

        List<String> valid = List.of("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED");
        if (!valid.contains(status)) throw new BadRequestException("Bad status: " + status);

        order.setShipmentStatus(status);
        return mapOrderToDTO(orderRepository.save(order));
    }

    @Override
    @Transactional
    public void cancelOrder(Long id, Authentication auth) {
        Order o = orderRepository.findById(id)
                                 .orElseThrow(() -> new ResourceNotFoundException("Order not found id=" + id));
        User u = (User) auth.getPrincipal();

        if (!o.getUser().getId().equals(u.getId()) && u.getRole() != Role.PLATFORM_ADMIN)
            throw new AccessDeniedException("Not your order");

        if (!List.of("PENDING", "CONFIRMED").contains(o.getShipmentStatus()))
            throw new BadRequestException("Cannot cancel order with status: " + o.getShipmentStatus());

        o.getItems().forEach(oi -> {
            Product p = oi.getProduct();
            p.setStockQuantity(p.getStockQuantity() + oi.getQuantity());
            productRepository.save(p);
        });

        o.setShipmentStatus("CANCELLED");
        orderRepository.save(o);
    }

    @Override
    @Transactional
    public void deleteOrder(Long id) {
        Order o = orderRepository.findById(id)
                                 .orElseThrow(() -> new ResourceNotFoundException("Order not found id=" + id));
        orderItemRepository.deleteAll(o.getItems());
        orderRepository.delete(o);
    }

    /* ──────────────────────────── seller transaction report ─────────────────────────── */

    /**
     * When <code>period</code> is <i>null</i> or blank we treat it as "all‐time".<br>
     * Accepted values (case‑insensitive): daily, weekly, monthly, yearly.  
     * Anything else → full‑history fallback.
     */
    @Override
    public Map<String, Object> getSellerTransactions(String period, Authentication auth) {
        User seller = (User) auth.getPrincipal();

        LocalDate today = LocalDate.now();
        String span = (period == null || period.isBlank())
                      ? "all"
                      : period.toLowerCase(Locale.ROOT);

        LocalDate startDate;
        switch (span) {
            case "daily"   -> startDate = today;                                      // today 00:00
            case "weekly"  -> startDate = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case "monthly" -> startDate = today.withDayOfMonth(1);
            case "yearly"  -> startDate = today.withDayOfYear(1);
            default        -> startDate = LocalDate.of(1970, 1, 1);                   // effectively "all"
        }

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end   = today.plusDays(1).atStartOfDay(); // inclusive‑today

        List<Order> orders = "all".equals(span)
                ? orderRepository.findAll()
                : orderRepository.findByOrderDateBetween(start, end);

        orders = orders.stream()
                       .filter(o -> o.getItems().stream()
                                     .anyMatch(i -> i.getStore().getSeller()
                                                     .getId().equals(seller.getId())))
                       .toList();

        BigDecimal totalSales   = BigDecimal.ZERO;
        int        orderCount   = orders.size();
        int        productCount = 0;
        Map<String, BigDecimal> productSales = new HashMap<>();

        for (Order o : orders) {
            for (OrderItem it : o.getItems()) {
                if (!it.getStore().getSeller().getId().equals(seller.getId())) continue;
                BigDecimal itemTotal = it.getPrice().multiply(BigDecimal.valueOf(it.getQuantity()));
                totalSales   = totalSales.add(itemTotal);
                productCount = productCount + it.getQuantity();

                productSales.merge(it.getProduct().getName(), itemTotal, BigDecimal::add);
            }
        }

        Map<String, Object> out = new HashMap<>();
        out.put("totalSales"   , totalSales);
        out.put("totalOrders"  , orderCount);
        out.put("totalProducts", productCount);
        out.put("productSales" , productSales);
        out.put("period"       , span);
        out.put("startDate"    , startDate);
        out.put("endDate"      , today);
        return out;
    }

    /* ──────────────────────────── mapping helpers ─────────────────────────── */

    private OrderDTO mapOrderToDTO(Order o) {
        OrderDTO dto = new OrderDTO();
        dto.setId(o.getId());
        dto.setOrderDate(o.getOrderDate());
        dto.setTotalAmount(o.getTotalAmount());
        dto.setStatus(o.getShipmentStatus());
        dto.setUserEmail(o.getUser().getEmail());
        dto.setItems(o.getItems().stream()
                      .map(this::mapOrderItemToDTO)
                      .toList());
        return dto;
    }

    private OrderItemDTO mapOrderItemToDTO(OrderItem it) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(it.getId());
        dto.setProductId(it.getProduct().getId());
        dto.setProductName(it.getProduct().getName());
        dto.setQuantity(it.getQuantity());
        dto.setPrice(it.getPrice());

        if (it.getStore() != null) {
            dto.setStoreId(it.getStore().getId());
            dto.setStoreName(it.getStore().getStoreName());
        }

        productImageRepository.findByProductAndPrimaryImageIsTrue(it.getProduct())
                              .ifPresent(img -> dto.setImageUrl(img.getImageUrl()));
        return dto;
    }
}
