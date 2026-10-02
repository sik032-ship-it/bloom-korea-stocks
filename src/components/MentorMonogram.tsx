// 실존 인물의 얼굴(초상)을 쓰지 않는 안전한 이니셜 배지.
// 초상권·퍼블리시티권 위험을 피하기 위해 인물 사진/닮은 그림 대신 사용한다.
import { cn } from "@/utils/cn";

interface Props {
  initials: string;
  className?: string;
}

export function MentorMonogram({ initials, className }: Props) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/10 text-primary font-black border-2 border-primary/20",
        className,
      )}
    >
      {initials}
    </div>
  );
}
