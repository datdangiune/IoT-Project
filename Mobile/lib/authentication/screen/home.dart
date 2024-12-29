import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:iot_20241/authentication/screen/history.dart';
import 'package:iot_20241/authentication/screen/widget/toast.dart';
import 'package:shared_preferences/shared_preferences.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({Key? key}) : super(key: key);
  Future<String?> _getUsernameFromPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('username');
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('HomeScreen'),
        automaticallyImplyLeading: false,
        centerTitle: true,
      ),
      body: StreamBuilder<QuerySnapshot>(
        stream: FirebaseFirestore.instance.collection('parking').snapshots(),
        builder: (context, snapshot) {
          // Kiểm tra nếu có lỗi
          if (snapshot.hasError) {
            return Center(
              child: Text('Lỗi: ${snapshot.error}'),
            );
          }

          // Kiểm tra nếu đang loading
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          // Kiểm tra nếu không có dữ liệu
          if (!snapshot.hasData || snapshot.data!.docs.isEmpty) {
            return const Center(
              child: Text('Không có dữ liệu trong Firestore!'),
            );
          }

          final parkingSlots = snapshot.data!.docs;
          int occupiedCount = parkingSlots.where((doc) => doc['status'] == 1).length;
          int totalSlots = parkingSlots.length;

          return Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Text(
                  'Số lượng xe hiện tại: $occupiedCount / Tổng số xe: $totalSlots',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              Expanded(
                child: GridView.builder(
                  padding: const EdgeInsets.all(16.0),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    mainAxisSpacing: 16,
                    crossAxisSpacing: 16,
                  ),
                  itemCount: parkingSlots.length,
                  itemBuilder: (context, index) {
                    final slot = parkingSlots[index];
                    final status = slot['status'] == 1 ? 'Đang đỗ' : 'Đang trống';

                    return Container(
                      decoration: BoxDecoration(
                        color: slot['status'] == 1 ? Colors.red[100] : Colors.green[100],
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Center(
                        child: Text(
                          'Ô ${slot['id']}: $status',
                          style: const TextStyle(fontSize: 16),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          );
        },
      ),
    );
  }

}
