class HistoryItem {
  final String checkin;
  final String checkout;
  final int payment;

  HistoryItem({
    required this.checkin,
    required this.checkout,
    required this.payment,
  });

  // Phương thức để chuyển từ JSON sang HistoryItem
  factory HistoryItem.fromJson(Map<String, dynamic> json) {
    return HistoryItem(
      checkin: json['checkin'],
      checkout: json['checkout'],
      payment: json['payment'],
    );
  }

  // Phương thức để chuyển từ HistoryItem sang JSON
  Map<String, dynamic> toJson() {
    return {
      'checkin': checkin,
      'checkout': checkout,
      'payment': payment,
    };
  }
}
