import React from 'react';
import {parseISO, format, differenceInMinutes, isToday} from 'date-fns';
import {utcToZonedTime} from 'date-fns-tz';
import {ko} from 'date-fns/locale';

const formatCustomDate = (dateString) => {
    // ISO 문자열을 Date 객체로 변환
    const date = parseISO(dateString);
    const now = new Date();
    // 현재 시간과 주어진 날짜의 차이를 분 단위로 계산
    const diffMinutes = differenceInMinutes(now, date);

    // 날짜가 올해인지 확인 (올해이면 연도 표시 생략)
    const isThisYear = date.getFullYear() === now.getFullYear();
    // 그 외의 경우에는 날짜를 원하는 형식으로 포맷 (예: 2025년 2월 5일 오전 8:18)
    if (isThisYear) {
        // 날짜가 오늘이면 '오늘'로 표시 (리터럴 텍스트는 작은따옴표로 감싸줍니다)
        if (isToday(date)) {
            return format(date, "a h:mm", {locale: ko});
        }

        // 올해: "월 일 오전/오후 시간:분" 형식
        return format(date, "M월 d일 a h:mm", {locale: ko});
    } else {
        // 올해가 아니면: "yyyy년 월 일 오전/오후 시간:분" 형식
        return format(date, "yyyy년 M월 d일 a h:mm", {locale: ko});
    }

};

const DateTimeUtil = (dateString) => {
    if (dateString === null || dateString === '' || dateString === 'undefined') {
        return '';
    }

    return formatCustomDate(dateString);
};

export function getNowDate() {
    // 현재 시각(UTC) 기준으로 Date 객체 생성
    const nowUtc = new Date();

    // 'Asia/Seoul'로 변환
    const seoulTime = utcToZonedTime(nowUtc, 'Asia/Seoul');

    // 원하는 형식으로 포맷 (예: 'yyyy-MM-dd HH:mm:ss')
    const formatted = format(seoulTime, "yyyy-MM-dd'T'HH:mm:ss", {timeZone: 'Asia/Seoul'});
    return formatted;
}

export default DateTimeUtil;
