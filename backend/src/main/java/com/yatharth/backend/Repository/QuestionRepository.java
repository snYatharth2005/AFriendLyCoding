package com.yatharth.backend.Repository;

import com.yatharth.backend.Model.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    Optional<Question> findBySlug(String slug);

    @Query("select q.slug from Question q")
    List<String> findAllSlugs();

    List<Question> findBySlugIn(List<String> slug);

    @Query("select q from Question q where q.slug = :slug")
    Question getReferenceBySlug(String slug);
}
