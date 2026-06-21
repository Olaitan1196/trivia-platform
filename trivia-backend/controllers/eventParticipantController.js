import axios from 'axios';
import EventParticipant from '../models/EventParticipant.js';
import Event from '../models/Event.js';
import Stage from '../models/Stage.js';
import Payment from '../models/Payment.js';
import QuizSession from '../models/QuizSession.js';
import User from '../models/User.js';

export const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user._id;
    const userEmail = req.user.email;
    const userCategory = req.user.category;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.category !== userCategory) {
      return res.status(403).json({ message: 'This event is not available for your category' });
    }

    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'Registration is closed for this event' });
    }

    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({ message: 'This event is full' });
    }

    const alreadyRegistered = await EventParticipant.findOne({ event: eventId, user: userId });

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    const reference = `EVENT-${Date.now()}-${userId}`;

    const paystackResponse = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: userEmail,
        amount: event.entryFee * 100,
        reference,
        callback_url: `${process.env.FRONTEND_URL}/payment-confirmation`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const newPayment = new Payment({
      user: userId,
      amount: event.entryFee,
      reference,
      purpose: 'quiz_entry',
      status: 'pending',
    });

    await newPayment.save();

    res.status(200).json({
      message: 'Payment initialized for event registration',
      authorizationUrl: paystackResponse.data.data.authorization_url,
      reference,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const confirmEventRegistration = async (req, res) => {
  try {
    const { reference, eventId } = req.body;
    const userId = req.user._id;

    const verifyResponse = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (verifyResponse.data.data.status !== 'success') {
      return res.status(400).json({ message: 'Payment was not successful' });
    }

    const payment = await Payment.findOne({ reference });
    payment.status = 'success';
    await payment.save();

    const event = await Event.findById(eventId);

    const firstStage = await Stage.findOne({ event: eventId }).sort({ stageNumber: 1 });

    const newParticipant = new EventParticipant({
      event: eventId,
      user: userId,
      paymentReference: reference,
      currentStage: firstStage ? firstStage._id : null,
    });

    await newParticipant.save();

    event.currentParticipants += 1;
    await event.save();

    res.status(201).json({
      message: 'Registration confirmed, you are now part of this event',
      participant: newParticipant,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getEventRanking = async (req, res) => {
  try {
    const { eventId, stageId } = req.params;

    const sessions = await QuizSession.find({
      event: eventId,
      stage: stageId,
      status: 'completed',
    })
      .populate('user', 'fullName category')
      .sort({ score: -1, completedAt: 1 });

    const ranking = sessions.map((session, index) => {
      const totalTimeMs = session.answers.reduce((sum, a) => sum + (a.timeTakenMs || 0), 0);

      return {
        rank: index + 1,
        userId: session.user._id,
        fullName: session.user.fullName,
        score: session.score,
        totalTimeMs,
        completedAt: session.completedAt,
      };
    });

    res.status(200).json(ranking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const advanceStageParticipants = async (req, res) => {
  try {
    const { eventId, currentStageId, nextStageId } = req.body;

    const currentStage = await Stage.findById(currentStageId);

    if (!currentStage) {
      return res.status(404).json({ message: 'Current stage not found' });
    }

    const sessions = await QuizSession.find({
      event: eventId,
      stage: currentStageId,
      status: 'completed',
    }).sort({ score: -1, completedAt: 1 });

    const qualifyingCount = currentStage.qualifyingCount;
    const qualifiedUserIds = sessions.slice(0, qualifyingCount).map((s) => s.user.toString());

    const allParticipants = await EventParticipant.find({ event: eventId });

    for (const participant of allParticipants) {
      const userIdStr = participant.user.toString();

      if (qualifiedUserIds.includes(userIdStr)) {
        participant.currentStage = nextStageId;
      } else {
        participant.isEliminated = true;
      }

      await participant.save();
    }

    currentStage.status = 'completed';
    await currentStage.save();

    res.status(200).json({
      message: 'Participants advanced to next stage',
      qualifiedCount: qualifiedUserIds.length,
      eliminatedCount: allParticipants.length - qualifiedUserIds.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getMyParticipantStatus = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    const participant = await EventParticipant.findOne({ event: eventId, user: userId })
      .populate('currentStage');

    if (!participant) {
      return res.status(200).json({ registered: false });
    }

    let alreadyPlayedCurrentStage = false;

    if (participant.currentStage) {
      const existingSession = await QuizSession.findOne({
        event: eventId,
        stage: participant.currentStage._id,
        user: userId,
      });

      alreadyPlayedCurrentStage = !!existingSession;
    }

    res.status(200).json({
      registered: true,
      isEliminated: participant.isEliminated,
      currentStage: participant.currentStage,
      alreadyPlayedCurrentStage,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const finalizeEventPayout = async (req, res) => {
  try {
    const { eventId, finalStageId } = req.body;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.isPaidOut) {
      return res.status(400).json({ message: 'This event has already been paid out' });
    }

    const finalStage = await Stage.findById(finalStageId);

    if (!finalStage || !finalStage.isFinalStage) {
      return res.status(400).json({ message: 'Selected stage is not a valid final stage' });
    }

    const sessions = await QuizSession.find({
      event: eventId,
      stage: finalStageId,
      status: 'completed',
    })
      .populate('user', 'fullName')
      .sort({ score: -1, completedAt: 1 });

    const totalPool = event.entryFee * event.currentParticipants;
    const platformCut = totalPool * (event.platformCutPercentage / 100);
    const distributable = totalPool - platformCut;

    const payouts = [];

    for (const entry of event.prizeDistribution) {
      const session = sessions[entry.rank - 1];

      if (!session) {
        continue;
      }

      const prizeAmount = distributable * (entry.percentage / 100);

      await User.findByIdAndUpdate(session.user._id, {
        $inc: { walletBalance: prizeAmount },
      });

      payouts.push({
        rank: entry.rank,
        userId: session.user._id,
        fullName: session.user.fullName,
        prizeAmount,
      });
    }

    event.isPaidOut = true;
    event.status = 'completed';
    await event.save();

    finalStage.status = 'completed';
    await finalStage.save();

    res.status(200).json({
      message: 'Event finalized and prizes credited',
      totalPool,
      platformCut,
      distributable,
      payouts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};