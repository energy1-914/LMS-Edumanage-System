import { Text } from "sfac-designkit-react";

const LectureCommentContentMention = ({
  content,
  nowPlayTimeHandler,
}: {
  nowPlayTimeHandler: (time: string) => void;
  content: string;
}) => {
  const parts = content.split(" ");
  const highlightedContent = parts.map((part, index) => {
    const timePattern = /\b\d{1,2}:\d{2}(:\d{2})?\b/; // MM:SS 또는 HH:MM:SS 패턴
    if (part.startsWith("@")) {
      return (
        <Text
          size="sm"
          weight="medium"
          key={index}
          className="text-primary-80 mr-2"
        >
          {part}
        </Text>
      );
    } else if (timePattern.test(part)) {
      return (
        <button
          onClick={() => {
            nowPlayTimeHandler(part);
          }}
          key={index}
          className="text-primary-80 mr-1"
        >
          <Text size="sm" weight="medium">
            {part}
          </Text>
        </button>
      );
    }
    return (
      <Text size="sm" weight="medium" key={index} className="mr-1">
        {part}
      </Text>
    );
  });

  return <>{highlightedContent}</>;
};

export default LectureCommentContentMention;
