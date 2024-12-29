import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:iot_20241/authentication/screen/signup.dart';
import 'package:iot_20241/authentication/screen/widget/form_container_widget.dart';
import 'package:iot_20241/authentication/screen/widget/toast.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../controller/auth_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});
  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  bool _isSigning = false;
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 15),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                "Login",
                style: TextStyle(fontSize: 27, fontWeight: FontWeight.bold),
              ),
              const SizedBox(
                height: 30,
              ),
              FormContainerWidget(
                controller: _usernameController,
                hintText: "Username",
                isPasswordField: false,
              ),
              const SizedBox(
                height: 10,
              ),
              FormContainerWidget(
                controller: _passwordController,
                hintText: "Password",
                isPasswordField: true,
              ),
              const SizedBox(
                height: 30,
              ),
              GestureDetector(
                onTap: () {
                  _signIn();
                },
                child: Container(
                  width: double.infinity,
                  height: 45,
                  decoration: BoxDecoration(
                    color: Colors.blue,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: _isSigning ? const CircularProgressIndicator(
                      color: Colors.white,) : const Text(
                      "Login",
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(
                height: 20,
              ),

              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("Don't have an account?"),
                  const SizedBox(
                    width: 5,
                  ),
                  GestureDetector(
                    onTap: () {
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(builder: (context) => SignUpPage()),
                            (route) => false,
                      );
                    },
                    child: const Text(
                      "Sign Up",
                      style: TextStyle(
                        color: Colors.blue,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _signIn() async {
    setState(() {
      _isSigning = true;
    });

    String username = _usernameController.text.trim(); // Lấy username từ input
    String password = _passwordController.text.trim(); // Lấy password từ input

    try {
      // Lấy thông tin người dùng từ Firestore
      final userRef = FirebaseFirestore.instance.collection('users');
      final userDoc = await userRef.doc(username).get();

      if (!userDoc.exists) {
        setState(() {
          _isSigning = false;
        });
        showToast(message: "User not found");
        return;
      }

      // Kiểm tra mật khẩu
      final userData = userDoc.data();
      if (userData?['password'] == password) {
        SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.setString('username', username);
        setState(() {
          _isSigning = false;
        });
        showToast(message: "User is successfully signed in");
        Navigator.pushNamed(context, "/home"); // Chuyển hướng tới Home
      } else {
        setState(() {
          _isSigning = false;
        });
        showToast(message: "Invalid password");
      }
    } catch (e) {
      setState(() {
        _isSigning = false;
      });
      showToast(message: "An error occurred: $e");
    }
  }

  Future<void> signIn(String username, String password) async {
    try {
      // Lấy thông tin người dùng từ Firestore
      final userRef = FirebaseFirestore.instance.collection('users');
      final userDoc = await userRef.doc(username).get();

      if (!userDoc.exists) {
        showToast(message: "User not found");
        return;
      }

      final userData = userDoc.data();
      if (userData?['password'] == password) {
        showToast(message: "Login successful");
        Navigator.pushNamed(context, "/home"); // Điều hướng đến trang Home
      } else {
        showToast(message: "Invalid password");
      }
    } catch (e) {
      showToast(message: "An error occurred: $e");
    }
  }
}
