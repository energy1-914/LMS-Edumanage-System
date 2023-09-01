type InformationTooltipProps = {
  showTooltip: boolean;
  setShowTooltip: (value: boolean) => void;
  handleIconMouseLeave: () => void;
  position: { x: number; y: number };
};

export default function InformationTooltip({
  showTooltip,
  setShowTooltip,
  handleIconMouseLeave,
  position,
}: InformationTooltipProps) {
  return (
    <>
      {showTooltip && (
        <div
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={handleIconMouseLeave}
          className="absolute bg-white p-2 border border-black rounded-md text-[#555] text-sm "
          style={{
            top: `${position.y}px`,
            left: `${position.x}px`,
          }}
        >
          활동지수란 ?
          <br />
          날짜별 사용자가 게시한 게시글, 댓글, 제출한 과제를
          <br />
          합산한 결과입니다.
        </div>
      )}
    </>
  );
}
