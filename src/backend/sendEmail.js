const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    // Инициализация транспортера
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "maksmebel0@gmail.com",
        pass: "qjdw wutc ogjh nfkf",
      },
    });

    this.adminEmail = "maksmebel0@gmail.com";
  }
  // Отправка кода
  async sendVerificationCode(userEmail, code) {
    // Формируем письмо
    const mailOptions = {
      from: `МАКС-МЕБЕЛЬ`,
      to: userEmail,
      subject: "Код подтверждения",
      html: `
          <h2>Подтверждение email</h2>
          <p>Ваш код подтверждения: <strong>${code}</strong></p>
          <p>Код действителен 10 минут</p>
        `,
    };

    // Отправляем
    await this.transporter.sendMail(mailOptions);
  }

  async sendNewOrderNotification(orderData) {
    const moscowTime = new Date(orderData.created_at).toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const mailOptions = {
      from: `МАКС-МЕБЕЛЬ`,
      to: this.adminEmail,
      subject: `Новый заказ `,
      text: `Поступил новый заказ от ${moscowTime}`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

// Создаем и экспортируем один экземпляр сервиса
export const emailService = new EmailService();

//emailService.sendVerificationCode("ptizajar@gmail.com");
