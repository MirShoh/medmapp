// --- MAXFIY SOZLAMALAR ---
// Bu faylni begonalarga ko'rsatmang. Unda muhim kalitlar saqlanadi.

// Telegram botingizning noyob tokeni
const TELEGRAM_BOT_TOKEN = '8131828140:AAFE1n8ZmVjA4FYnCUqf8DXAXdpIgmIfw8o';

// Xabarlar yuboriladigan Telegram chat yoki kanal IDsi
const TELEGRAM_CHAT_ID = '-1002986780438';

// Bitrix24 bilan bog'lanish uchun veb-xuk URL manzili
const BITRIX_WEBHOOK_URL = 'https://medmapp.bitrix24.ru/rest/1/qll2ixemwxbcimkg/crm.lead.add.json';

// Bitrix24'dagi fayllarni saqlash uchun maxsus maydon IDsi
const CUSTOM_LEAD_FILE_FIELD_ID = 'UF_CRM_1758364398';

// Bitrix24 sayt tugmasi uchun yuklovchi skript
(function(w, d, u) {
    var s = d.createElement('script');
    s.async = true;
    s.src = u + '?' + (Date.now() / 60000 | 0);
    var h = d.getElementsByTagName('script')[0];
    h.parentNode.insertBefore(s, h);
})(window, document, 'https://cdn-ru.bitrix24.ru/b35079736/crm/site_button/loader_2_t814vm.js');
