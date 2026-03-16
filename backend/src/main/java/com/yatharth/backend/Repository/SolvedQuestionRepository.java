package com.yatharth.backend.Repository;

import com.yatharth.backend.Model.SolvedQuestion;
import com.yatharth.backend.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

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

    @Query("""
    select sq.question.frontendId, sq.user
        from SolvedQuestion sq
        where sq.question.frontendId in :ids
""")
    List<Object[]> findUsersByQuestionIds(Set<String> ids);

    @Query("""
    select sq.question.slug
    from SolvedQuestion sq
    where sq.user.id = :userId
""")
    Set<String> findSolvedSlugsByUserId(Long userId);

    List<SolvedQuestion> findByUser(User user);
}
