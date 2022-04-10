package com.cc.a1.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import java.util.Date;
import java.util.List;

/**
 * User JPA entity to represent the user data model.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    @NotBlank(message = "Username cannot be blank.")
    @Email(message = "Not a valid email.")
    @Pattern(regexp = "^s\\d{7}@student.rmit.edu.au$", message = "Email must be your RMIT student email.")
    private String username;

    @NotBlank(message = "Password cannot be blank.")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String password;

    @NotBlank(message = "User needs to have a role defined.")
    @Pattern(regexp = "^ROLE_USER|ROLE_ADMIN$", message = "Not a valid role.")
    private String role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Post> posts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Like> likes;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Comment> comments;

    // The following fields are for debugging purposes only.
    private Date createdAt;
    private Date updatedAt;

    /**
     * Saves the timestamp of creation.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
    }

    /**
     * Updates the timestamp of modification.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }

    /**
     * Enum to identify the different user roles.
     */
    public enum UserRole {
        USER("ROLE_USER"),
        ADMIN("ROLE_ADMIN");

        public final String string;

        UserRole(String string) {
            this.string = string;
        }
    }

}
