package movlit.be.member.domain;

import lombok.Getter;
import movlit.be.common.util.ids.MemberId;

@Getter
public class MemberGenre {

    private MemberId memberId;
    private Long genreId;

}
