// ============================================================
//  Приём заявок с сайта: строка в Google Таблицу + сообщение в Telegram.
//  Вставить: Таблица → Расширения → Apps Script.
//  Токен бота хранится здесь, на стороне Google, — на сайте его не видно.
// ============================================================

const BOT_TOKEN = 'ВСТАВЬТЕ_ТОКЕН_БОТА';   // от @BotFather
const CHAT_ID = 'ВАШ_TELEGRAM_ID';          // кому слать заявки (узнать: /myid в любом вашем боте)
const HEADERS = ['Дата', 'Имя', 'Телефон', 'Услуга', 'Когда удобно', 'Комментарий', 'Страница', 'Статус'];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (!d.name || !d.phone) return reply({ ok: false, error: 'нет имени или телефона' });

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#d9ebfa');
      sheet.setFrozenRows(1);
    }
    const now = Utilities.formatDate(new Date(), 'Europe/Moscow', 'dd.MM.yyyy HH:mm');
    // Апостроф — чтобы телефон и текст не превратились в число или формулу
    const t = v => "'" + String(v || '').slice(0, 500);
    sheet.appendRow([now, t(d.name), t(d.phone), t(d.service), t(d.when), t(d.comment), t(d.page), 'Новая']);

    const text = '📥 Заявка с сайта\n\n' +
      'Имя: ' + d.name + '\nТелефон: ' + d.phone + '\nУслуга: ' + d.service +
      (d.when ? '\nКогда: ' + d.when : '') + (d.comment ? '\nКомментарий: ' + d.comment : '');
    UrlFetchApp.fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ chat_id: CHAT_ID, text: text }),
      muteHttpExceptions: true,
    });
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
