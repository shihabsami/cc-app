package com.cc.a1.controller;

import com.cc.a1.model.Image;
import com.cc.a1.model.Post;
import com.cc.a1.security.JwtUtility;
import com.cc.a1.service.ImagesService;
import com.cc.a1.service.PostsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

import static com.cc.a1.security.SecurityConstants.AUTHORIZATION_HEADER;
import static com.cc.a1.security.SecurityConstants.JWT_SCHEME;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostsService postsService;
    private final ImagesService imagesService;
    private final JwtUtility jwtUtility;

    @Autowired
    public PostController(PostsService postsService, ImagesService imagesService,
                          JwtUtility jwtUtility) {
        this.postsService = postsService;
        this.imagesService = imagesService;
        this.jwtUtility = jwtUtility;
    }

    @PostMapping("/save")
    public ResponseEntity<?> save(@RequestHeader(name = AUTHORIZATION_HEADER) String jwt, @RequestParam String text,
                                  @RequestParam(required = false) Optional<MultipartFile> image) {
        String username = jwtUtility.extractUsername(jwt.substring(JWT_SCHEME.length() + 1));
        Post post = postsService.savePost(text, username);
        if (image.isPresent()) {
            Image postImage = imagesService.savePostImage(image.get(), post.getId());
            post.setImage(postImage);
        }

        return new ResponseEntity<>(post, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable long id) {
        return new ResponseEntity<>(postsService.getPostById(id), HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<?> getPosts(@RequestParam int page) {
        return new ResponseEntity<>(postsService.getPosts(page), HttpStatus.OK);
    }

}
