package com.example.services;

import com.example.models.Banner;
import com.example.repositories.BannerRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BannerService {

    private final BannerRepository bannerRepository;

    public BannerService(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public Banner getBannerById(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));
    }

    public Banner createBanner(Banner banner) {
        return bannerRepository.save(banner);
    }

    public Banner updateBanner(Long id, Banner bannerDetails) {
        Banner existingBanner = getBannerById(id);
        
        // Update mutable fields
        existingBanner.setTitle(bannerDetails.getTitle());
        existingBanner.setFinishDate(bannerDetails.getFinishDate());
        existingBanner.setImageUrl(bannerDetails.getImageUrl());
        
        return bannerRepository.save(existingBanner);
    }

    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }
}