import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ImageBackground,
  Image,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleRegister = () => {
    if (!email || !password || !username) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    Alert.alert("Success", "Registration successful!");
  };

  return (
    <ImageBackground
      source={{ uri: "https://i.postimg.cc/QMfwm29G/bg.png" }}
      style={styles.screen}
      resizeMode="cover"
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>
          <Text style={styles.headerTextBold}>ELEVATING</Text>
          {"\n"}
          <Text style={styles.headerTextLight}>FITNESS</Text>
        </Text>
      </View>

      {/* Form Container */}
      <View style={styles.container}>
        {/* Character Image */}
        <Image
          source={{ uri: "https://i.postimg.cc/XYnqR5JK/char.png" }}
          style={styles.characterImage}
        />

        <Text style={styles.title}>Sign Up</Text>

        {/* Email Input */}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#AAAAAA"
          autoCapitalize="none"
        />

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#AAAAAA"
          />
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#FF5733"
            />
          </TouchableOpacity>
        </View>

        {/* Username Input */}
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#AAAAAA"
        />

        {/* Register Button */}
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>
          Already a user?{" "}
          <TouchableOpacity onPress={() => console.log("Navigate to Login Screen")}>
            <Text style={styles.linkText}>Log in</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  header: {
    position: "absolute",
    top: 50,
    alignItems: "flex-start",
    width: "100%",
    paddingLeft: 20,
  },
  headerText: {
    fontSize: 28,
    textAlign: "left",
    marginTop: 10,
    lineHeight: 60,
  },
  headerTextBold: {
    fontWeight: "bold",
    fontFamily: "inter",
    color: "#FFECEC",
    fontSize: 48,
  },
  headerTextLight: {
    bottom: -90,
    fontFamily: "inter",
    fontWeight: "300",
    color: "#FFFFFF",
    fontSize: 48,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
    position: "relative",
  },
  characterImage: {
    position: "absolute",
    top: -320,
    right: -10,
    width: 272,
    height: 580,
    resizeMode: "contain",
  },
  title: {
    fontFamily: "inter",
    fontSize: 40,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    color: "#000000",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#FF5733",
  },
  inputContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  iconContainer: {
    position: "absolute",
    right: 10,
    padding: 10,
  },
  button: {
    backgroundColor: "#FF5733",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  footerText: {
    marginTop: 20,
    color: "#AAAAAA",
    fontSize: 14,
  },
  linkText: {
    bottom: -5,
    color: "#FF5733",
    fontWeight: "bold",
  },
});

export default RegisterPage; 