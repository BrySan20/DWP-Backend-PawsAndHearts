const contactService = require('../services/contactService');

const sendEmailController = async (req, res) => {
  try {
    const { from, to, subject, body } = req.body;

    if (!from || !to || !subject || !body) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const result = await contactService.sendEmail(from, to, subject, body);
    
    return res.status(200).json({ 
      message: 'Correo enviado exitosamente', 
      messageId: result.messageId 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error al enviar el correo' });
  }
};

module.exports = {
  sendEmailController
};