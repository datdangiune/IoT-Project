import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:intl/intl.dart';

class HistoryScreen extends StatelessWidget {
  final String userId;
  const HistoryScreen({Key? key, required this.userId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lịch sử gửi xe'),
        centerTitle: true, // Căn giữa tiêu đề
        automaticallyImplyLeading: false, // Bỏ nút mũi tên quay lại
      ),
      body: FutureBuilder<DocumentSnapshot>(
        future: FirebaseFirestore.instance.collection('users').doc(userId).get(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Text('Lỗi: ${snapshot.error}'),
            );
          }

          if (!snapshot.hasData || snapshot.data == null) {
            return const Center(
              child: Text('Không có dữ liệu lịch sử.'),
            );
          }

          final historyData = snapshot.data!.get('history') as List<dynamic>;

          if (historyData.isEmpty) {
            return const Center(
              child: Text('Không có lịch sử gửi xe.'),
            );
          }

          return ListView.builder(
            itemCount: historyData.length,
            itemBuilder: (context, index) {
              final entry = historyData[index];
              final checkinRaw = entry['checkin'] ?? 'Chưa có';
              final checkoutRaw = entry['checkout'] ?? 'Chưa có';
              final payment = entry['payment'] ?? 0;

              // Chuyển đổi định dạng ngày
              final checkin = _formatDateTime(checkinRaw);
              final checkout = _formatDateTime(checkoutRaw);

              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.shade300,
                      blurRadius: 8,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Lần gửi xe ${index + 1}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.blueAccent,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Check-in: $checkin',
                      style: const TextStyle(fontSize: 16),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Check-out: $checkout',
                      style: const TextStyle(fontSize: 16),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Giá tiền: $payment VND',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  /// Hàm chuyển đổi định dạng DateTime
  String _formatDateTime(dynamic rawDateTime) {
    if (rawDateTime == null || rawDateTime == 'Chưa có') return 'Chưa có';
    try {
      DateTime dateTime;

      // Nếu là Timestamp, chuyển sang DateTime
      if (rawDateTime is Timestamp) {
        dateTime = rawDateTime.toDate();
      } else if (rawDateTime is String) {
        // Nếu là String, parse thành DateTime
        dateTime = DateTime.parse(rawDateTime);
      } else {
        throw Exception('Định dạng không hợp lệ');
      }

      // Format DateTime thành chuỗi
      return DateFormat('dd/MM/yyyy HH:mm:ss').format(dateTime);
    } catch (e) {
      return 'Định dạng không hợp lệ';
    }
  }

}
