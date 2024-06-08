import React, { useRef } from "react";
import { Alert, Dimensions, StyleSheet } from "react-native";
import DocumentPicker from "react-native-document-picker";
import RNFS from "react-native-fs";
import { WebView } from "react-native-webview";

const { height: screenHeight } = Dimensions.get("window");

const MyWebView = () => {
  const webviewRef = useRef(null);

  // const onMessage = async (event) => {
  //   // This is where you handle the data received from the web app

  //   const data = event.nativeEvent.data;
  //   console.log("Data received from web app:", data);

  //   const parsedData = JSON.parse(data);
  //   if (parsedData.action === "openFilePicker") {
  //     // Open the file picker
  //     try {
  //       const file = await DocumentPicker.pick({
  //         type: [DocumentPicker.types.allFiles],
  //       });
  //       console.log("Selected file:", file);
  //       Alert.alert("File Selected", `You selected ${file.name}`);
  //       // You can send the file details back to the web app if needed
  //       webviewRef.current.postMessage(JSON.stringify({ file: file }));
  //     } catch (err) {
  //       if (DocumentPicker.isCancel(err)) {
  //         // User cancelled the picker
  //         console.log("User cancelled the file picker");
  //       } else {
  //         throw err;
  //       }
  //     }
  //   }
  //   // Perform any actions with the received data
  // };

  const onMessage = async (event) => {
    const data = event.nativeEvent.data;
    console.log("Data received from web app:", data);

    // Parse the received data (assuming it's JSON)
    const parsedData = JSON.parse(data);
    if (parsedData.action === "openFilePicker") {
      // Open the file picker
      try {
        const file = await DocumentPicker.pick({
          type: [DocumentPicker.types.allFiles],
        });
        console.log("Selected file:", file);
        Alert.alert("File Selected", `You selected ${file.name}`);

        // Read the file as a Base64 string
        const filePath = file.uri;
        const base64File = await RNFS.readFile(filePath, "base64");

        // Send the file data back to the web app
        webviewRef.current.postMessage(
          JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileData: base64File,
          })
        );
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          // User cancelled the picker
          console.log("User cancelled the file picker");
        } else {
          throw err;
        }
      }
    }
  };

  return (
    <WebView
      source={{
        uri: "https://white-marie-ann-16.tiiny.site/",
      }}
      injectedJavaScript={`window.ReactNativeWebView.postMessage("WebView is ready");`}
      javaScriptEnabled={true}
      ref={webviewRef}
      style={styles.webview}
      onShouldStartLoadWithRequest={handleUrlLoading}
      onMessage={onMessage}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    height: screenHeight - 65,
    padding: 10,
    marginBottom: 20,
  },
  webview: {
    height: 300,
    backgroundColor: "white",
  },
});
export default MyWebView;
