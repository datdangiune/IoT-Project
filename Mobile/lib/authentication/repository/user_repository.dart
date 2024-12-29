import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:iot_20241/authentication/model/usermodel.dart';

class UserRepository {
  final CollectionReference usersCollection =
  FirebaseFirestore.instance.collection('users');

  // Tạo user mới
  Future<void> createUser(UserModel user) async {
    try {
      await usersCollection.doc(user.username).set(user.toJson());
    } catch (e) {
      print('Error creating user: $e');
    }
  }

  // Đọc thông tin user theo username
  Future<UserModel?> getUser(String username) async {
    try {
      DocumentSnapshot doc = await usersCollection.doc(username).get();
      if (doc.exists) {
        return UserModel.fromSnapshot(doc.data() as Map<String, dynamic>);
      }
    } catch (e) {
      print('Error getting user: $e');
    }
    return null;
  }

  // Cập nhật thông tin user
  Future<void> updateUser(String username, Map<String, dynamic> updates) async {
    try {
      await usersCollection.doc(username).update(updates);
    } catch (e) {
      print('Error updating user: $e');
    }
  }

  // Xóa user theo username
  Future<void> deleteUser(String username) async {
    try {
      await usersCollection.doc(username).delete();
    } catch (e) {
      print('Error deleting user: $e');
    }
  }

  // Lấy danh sách tất cả users
  Future<List<UserModel>> getAllUsers() async {
    try {
      QuerySnapshot querySnapshot = await usersCollection.get();
      return querySnapshot.docs
          .map((doc) =>
          UserModel.fromSnapshot(doc.data() as Map<String, dynamic>))
          .toList();
    } catch (e) {
      print('Error fetching users: $e');
      return [];
    }
  }
}
