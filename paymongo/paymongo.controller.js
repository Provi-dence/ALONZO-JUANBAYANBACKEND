const paymongoService = require('../paymongo/paymongo.service'); // Correct relative path

exports.handleCreatePaymentIntent = async (req, res) => {
    const { amount } = req.body;
    try {
        const paymentIntent = await paymongoService.createPaymentIntent(amount);
        res.status(200).json({ source_url: paymentIntent.data.attributes.next_action.redirect.url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.handlePayMongoWebhook = async (req, res) => {
    const event = req.body;
    
    // Check the event type and update campaign if the payment was successful
    if (event.data.attributes.status === 'succeeded') {
        const { id: campaignId, amount } = event.data.attributes.metadata;

        // Update the campaign with the donation amount
        await campaignService.handleDonation(campaignId, amount / 100); // Convert centavos back to PHP
        return res.status(200).json({ message: 'Donation processed successfully' });
    }

    res.status(400).json({ message: 'Unhandled event type' });
};
