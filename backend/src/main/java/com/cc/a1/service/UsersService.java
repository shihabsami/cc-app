package com.cc.a1.service;

import com.cc.a1.exception.UserNotFoundException;
import com.cc.a1.exception.UsernameAlreadyExistsException;
import com.cc.a1.model.User;
import com.cc.a1.payload.UserProfile;
import com.cc.a1.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service layer for the {@link User} JPA entity.
 */
@Service
public class UsersService {

    private final UsersRepository usersRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UsersService(UsersRepository usersRepository, BCryptPasswordEncoder passwordEncoder) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Saves a new user into the database.
     */
    public User saveUser(User user) {
        if (usersRepository.existsByUsername(user.getUsername()))
            throw new UsernameAlreadyExistsException(
                    String.format("User with email %s already exists.", user.getUsername()));

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return usersRepository.save(user);
    }

    /**
     * Get a user by their id.
     */
    public User getUserById(long id) {
        return usersRepository.findById(id).orElseThrow(
                () -> new UserNotFoundException(String.format("User by id %d not found.", id)));
    }

    /**
     * Get a user by their username.
     */
    public User getUserByUsername(String username) {
        return usersRepository.findByUsername(username).orElseThrow(
                () -> new UserNotFoundException(String.format("User with email %s not found\n", username)));
    }

    /**
     * Get a user's profile (including complex properties) by their id.
     */
    public UserProfile getUserProfileById(long id) {
        return new UserProfile(getUserById(id));
    }

}
