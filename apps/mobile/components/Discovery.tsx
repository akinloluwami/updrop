import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

const SERVER_IP = "192.168.100.218";
const SERVER_PORT = 7656;

export default function Discovery() {
  const [services, setServices] = useState([
    {
      name: "Updrop Server",
      addresses: [SERVER_IP],
      port: SERVER_PORT,
    },
  ]);

  return (
    <View className="p-4">
      <Text className="text-xl mb-4 font-bold">Available Updrop Servers</Text>
      <FlatList
        data={services}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              alert(`Connect to http://${item.addresses[0]}:${item.port}`);
            }}
            className="p-4 border rounded mb-2"
          >
            <Text>{item.name}</Text>
            <Text>
              {item.addresses[0]}:{item.port}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
