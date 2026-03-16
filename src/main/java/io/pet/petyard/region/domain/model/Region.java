package io.pet.petyard.region.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "regions", schema = "public")
public class Region {

    @Id
    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    private String parentCode;

    @Column(nullable = false)
    private Integer level;

    protected Region() {
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getParentCode() {
        return parentCode;
    }

    public Integer getLevel() {
        return level;
    }
}
