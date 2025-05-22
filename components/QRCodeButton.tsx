import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from '@expo/vector-icons';

interface QRCodeButton {
  handleOpenQRCode: () => void;
}
export default function QRCodeButton({ handleOpenQRCode }: QRCodeButton) {
  return (
    <TouchableOpacity
      onPress={handleOpenQRCode}
      style={{
        width: 200,
        alignItems: "center",
        top: "65%",
        alignSelf: "center",
        padding: 6,
        borderWidth: 3,
        borderRadius: 10,
        borderStyle: "dashed",
        borderColor: "white",
        height: 100
      }}
    >
      <Ionicons name="qr-code" size={34} color="purple" />
      <Text style={{ color: "green", fontWeight: '800' }}>
        QR Code Detected
      </Text>
    </TouchableOpacity>
  );
}
