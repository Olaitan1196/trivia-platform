import CategoryFee from '../models/CategoryFee.js';

export const setCategoryFee = async (req, res) => {
  try {
    const { category, minFee, maxFee } = req.body;

    if (minFee > maxFee) {
      return res.status(400).json({ message: 'Minimum fee cannot be greater than maximum fee' });
    }

    const updatedFee = await CategoryFee.findOneAndUpdate(
      { category },
      { category, minFee, maxFee, updatedAt: Date.now() },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: 'Category fee updated successfully',
      data: updatedFee,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getAllCategoryFees = async (req, res) => {
  try {
    const fees = await CategoryFee.find();
    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};