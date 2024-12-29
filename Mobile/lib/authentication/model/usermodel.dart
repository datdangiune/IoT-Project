import 'package:iot_20241/authentication/model/historymodel.dart';

class UserModel {
  final String username;
  final double amount;
  final List<HistoryItem> history;

  UserModel({
    required this.username,
    required this.amount,
    required this.history,
  });

  // Chuyển từ JSON sang UserModel
  factory UserModel.fromSnapshot(Map<String, dynamic> json) {
    return UserModel(
      username: json['username'],
      amount: json['amount'],
      history: (json['history'] as List)
          .map((e) => HistoryItem.fromJson(e))
          .toList(),
    );
  }

  // Chuyển từ UserModel sang JSON
  Map<String, dynamic> toJson() {
    return {
      'username': username,
      'amount': amount,
      'history': history.map((e) => e.toJson()).toList(),
    };
  }
}
