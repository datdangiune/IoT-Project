import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

class CardScreen extends StatefulWidget {
  final String userId;

  const CardScreen({Key? key, required this.userId}) : super(key: key);

  @override
  _CardScreenState createState() => _CardScreenState();
}

class _CardScreenState extends State<CardScreen> {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  List<String> cardIds = [];

  @override
  void initState() {
    super.initState();
    _fetchCards();
  }

  // Fetch cards for the given userId
  Future<void> _fetchCards() async {
    final snapshot = await _firestore
        .collection('cards')
        .where('userId', isEqualTo: widget.userId)
        .get();

    setState(() {
      cardIds = snapshot.docs.map((doc) => doc['cardId'] as String).toList();
    });
  }

  // Add a new card to Firestore
  Future<void> _addCard(String newCardId) async {
    await _firestore.collection('cards').add({
      'cardId': newCardId,
      'userId': widget.userId,
    });
    _fetchCards(); // Refresh list after adding
  }

  // Show dialog to add new card
  void _showAddCardDialog() {
    final TextEditingController cardIdController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Add New Card"),
          content: TextField(
            controller: cardIdController,
            decoration: const InputDecoration(hintText: "Enter Card ID"),
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
                final newCardId = cardIdController.text.trim();
                if (newCardId.isNotEmpty) {
                  _addCard(newCardId);
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
        title: const Text("Card List"),
      ),
      body: cardIds.isEmpty
          ? const Center(
        child: Text("No cards found."),
      )
          : ListView.builder(
        itemCount: cardIds.length,
        itemBuilder: (context, index) {
          return Card(
            margin: const EdgeInsets.symmetric(
                vertical: 8.0, horizontal: 16.0),
            color: Colors.blue.shade50,
            child: ListTile(
              title: Text(
                cardIds[index],
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showAddCardDialog,
        child: const Icon(Icons.add),
      ),
    );
  }
}
