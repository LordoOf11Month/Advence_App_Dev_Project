package com.example.DTO;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class BulkInventoryUpdateDTO {
    private List<Map<String, Object>> updates;
}
