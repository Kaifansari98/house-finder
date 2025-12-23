import { View } from "react-native";

const StatusDot = ({ color = "green", size = 8 }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
};

export default StatusDot;
