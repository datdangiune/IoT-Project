const entry = (req, res) => {
    const { uid } = req.body;
    console.log(`Processing entry for UID: ${uid}`);
    // Add your logic here to handle the entry
    res.status(200).json({ message: 'Entry allowed', uid });
  };
  
  const exit = (req, res) => {
    const { uid } = req.body;
    console.log(`Processing exit for UID: ${uid}`);
    // Add your logic here to handle the exit
    res.status(200).json({ message: 'Exit allowed', uid });
  };
  
  module.exports = {
    entry,
    exit,
  };