package com.yatharth.backend.Repository;

import com.yatharth.backend.Model.SolvedQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolvedQuestionRepository extends JpaRepository<SolvedQuestion, Long> {
    @Query("""
        select sQuestion
        from SolvedQuestion sQuestion
        join fetch sQuestion.question q
        where sQuestion.user.id = :userId
    """)
    List<SolvedQuestion> findSolvedQuestionByUserId(Long userId);

    @Query("""
        select count(sq) > 0
        from SolvedQuestion sq
        where sq.user.id = :userId
          and sq.question.slug = :slug
    """)
    Boolean existsByUserIdAndQuestionSlug(Long userId, String slug);

}
