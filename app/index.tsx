import * as DocumentPicker from "expo-document-picker";
import React, { useRef } from "react";
import {
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { WebView } from "react-native-webview";
import { Colors } from "react-native/Libraries/NewAppScreen";

const { height: screenHeight } = Dimensions.get("window");

export default function Index() {
  const isDarkMode = useColorScheme() === "dark";

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const webviewRef = useRef(null);

  const onMessage = async (event) => {
    const data = event.nativeEvent.data;
    console.log("Data received from web app:", data);

    // Parse the received data (assuming it's JSON)
    console.log(data);
    const parsedData = JSON.parse(data);
    if (parsedData.action === "openFilePicker") {
      // Open the file picker
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "image/*",
        });
        console.log(result);
        if (!result.canceled) {
          // Read the file as a Base64 string
          const fileDetails = result.assets[0];
          const fileUri = result.assets[0].uri;
          const response = await fetch(fileUri);
          const blob = await response.blob();
          console.log("blob created");
          const reader = new FileReader();
          console.log(reader);
          reader.onloadend = () => {
            const base64File = reader.result.split(",")[1];

            // Send the file data back to the web app
            console.log("preparing file");
            const sendData = {
              fileName: fileDetails.name,
              fileType: fileDetails.mimeType,
              fileData: base64File,
            };
            console.log("file ready to send");
            webviewRef.current.postMessage(JSON.stringify(sendData));
            console.log("file sent");
          };
          reader.readAsDataURL(blob);
        }
      } catch (err) {
        console.log("Error picking document:", { err });
      }
    }
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <View style={{ marginTop: 10, height: "auto" }}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 20,
            textAlign: "center",
            color: "#fff",
          }}
        >
          Kapture SDK
        </Text>
        <View style={{ marginBottom: 10 }}>
          <View style={styles.container}>
            <WebView
            injectedJavaScript={`
              window.addEventListener("message", function (event) {
                document.getElement("body").innerText = "got file";
                });`}
              ref={webviewRef}
              source={{ uri: "https://white-marie-ann.tiiny.site/" }} // Replace with your web app URL
              // source={{ uri: "https://google.com" }}
              onMessage={onMessage}
              javaScriptEnabled={true}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: 500,
    padding: 10,
    marginBottom: 20,
  },
  webview: {
    height: 300,
    backgroundColor: "white",
  },
});
