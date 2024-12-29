import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class AmountScreen extends StatefulWidget {
  final String userId;

  const AmountScreen({Key? key, required this.userId}) : super(key: key);

  @override
  _AmountScreenState createState() => _AmountScreenState();
}

class _AmountScreenState extends State<AmountScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  double currentAmount = 0.0;

  @override
  void initState() {
    super.initState();
    _fetchAmount();
  }

  // Fetch current amount from Firestore
  Future<void> _fetchAmount() async {
    final doc = await _firestore.collection('users').doc(widget.userId).get();
    setState(() {
      currentAmount = (doc['amount'] ?? 0.0).toDouble();
    });
  }

  // Update the amount in Firestore
  Future<void> _updateAmount(double addedAmount) async {
    final docRef = _firestore.collection('users').doc(widget.userId);
    await docRef.update({
      'amount': FieldValue.increment(addedAmount), // Increment the amount
    });
    _fetchAmount(); // Refresh the displayed amount
  }

  // Show popup to add amount
  void _showAddAmountDialog() {
    final TextEditingController amountController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Add to Amount"),
          content: TextField(
            controller: amountController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(hintText: "Enter amount to add"),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close the dialog
              },
              child: const Text("Cancel"),
            ),
            ElevatedButton(
              onPressed: () {
                final addedAmount = double.tryParse(amountController.text.trim());
                if (addedAmount != null && addedAmount > 0) {
                  _updateAmount(addedAmount);
                }
                Navigator.of(context).pop(); // Close the dialog
              },
              child: const Text("Save"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Amount Screen"),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Số dư hiện tại:",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Text(
              "${currentAmount.toStringAsFixed(0)} \VND",
              style: const TextStyle(
                fontSize: 36,
                fontWeight: FontWeight.bold,
                color: Colors.green,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _showAddAmountDialog,
              child: const Text("Cộng số dư"),
            ),
          ],
        ),
      ),
    );
  }
}
