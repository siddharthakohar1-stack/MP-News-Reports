const bcrypt = require("bcryptjs");
const db = require("./db");

async function run() {
  const userCountRow = await db.get("SELECT COUNT(*) c FROM users");
  if (userCountRow.c > 0) {
    console.log("Already seeded. Skipping.");
    return;
  }

  const users = [
    ["Super Admin", "admin@mpnews.local", "Admin@123", "super_admin"],
    ["Editor Sharma", "editor@mpnews.local", "Editor@123", "editor"],
    ["Reporter Verma", "reporter@mpnews.local", "Reporter@123", "reporter"],
  ];
  const userIds = {};
  for (const [name, email, pw, role] of users) {
    const hash = bcrypt.hashSync(pw, 10);
    const info = await db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [
      name,
      email,
      hash,
      role,
    ]);
    userIds[role] = info.lastInsertRowid;
  }

  const categories = [
    ["mp-news", "मध्य प्रदेश", "--blue"],
    ["national", "देश", "--politics"],
    ["world", "विदेश", "--blue-light"],
    ["politics", "राजनीति", "--politics"],
    ["business", "बिजनेस", "--business"],
    ["sports", "खेल", "--sports"],
    ["entertainment", "मनोरंजन", "--entertainment"],
    ["tech-auto", "टेक-ऑटो", "--blue"],
    ["jobs", "जॉब्स-एजुकेशन", "--blue"],
    ["lifestyle", "लाइफस्टाइल", "--lifestyle"],
    ["astrology", "धर्म-ज्योतिष", "--saffron"],
    ["opinion", "ओपिनियन", "--business"],
  ];
  const catIds = {};
  for (const [slug, name, color] of categories) {
    const info = await db.run("INSERT INTO categories (slug, name, color_var) VALUES (?, ?, ?)", [slug, name, color]);
    catIds[slug] = info.lastInsertRowid;
  }

  const cities = [
    ["bhopal", "भोपाल"],
    ["indore", "इंदौर"],
    ["jabalpur", "जबलपुर"],
    ["gwalior", "ग्वालियर"],
    ["ujjain", "उज्जैन"],
    ["sagar", "सागर"],
    ["rewa", "रीवा"],
  ];
  const cityIds = {};
  for (const [slug, name] of cities) {
    const info = await db.run("INSERT INTO cities (slug, name) VALUES (?, ?)", [slug, name]);
    cityIds[slug] = info.lastInsertRowid;
  }

  const insertArticleSql = `
    INSERT INTO articles
      (title, summary, image_url, category_id, city_id, is_breaking, is_featured, is_published, video_duration, author_id, published_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, datetime('now', ?))
  `;

  const seedImg = (n) => `https://picsum.photos/seed/mpnews${n}/500/375`;
  const editor = userIds.editor;
  const reporter = userIds.reporter;

  const articles = [
    // title, summary, image seed, category, city, breaking, featured, video_dur, author, time offset
    ["भोपाल में मेट्रो का दूसरा फेज शुरू: CM ने हरी झंडी दिखाई, 14 नए स्टेशन जुड़े", "", seedImg(1), "mp-news", "bhopal", 0, 0, null, editor, "-15 minutes"],
    ["विधानसभा मानसून सत्र आज से: विपक्ष किसान कर्जमाफी पर घेरेगा सरकार को", "", seedImg(2), "politics", null, 0, 0, null, editor, "-32 minutes"],
    ["पुतिन BRICS समिट के लिए भारत आएंगे: 11 सितंबर को PM मोदी से मुलाकात तय", "", seedImg(3), "world", null, 0, 0, null, editor, "-45 minutes"],
    ["नर्मदा उफान पर: होशंगाबाद-जबलपुर में हाई अलर्ट, 40 गांव प्रभावित", "", seedImg(4), "mp-news", "jabalpur", 1, 0, null, reporter, "-1 hour"],
    ["इंदौर के छात्र ने बनाई सोलर साइकिल: बिना पेट्रोल 60 KM तक चलेगी", "", seedImg(5), "lifestyle", "indore", 0, 0, null, reporter, "-2 hours"],

    ["मध्य प्रदेश में नई औद्योगिक नीति लागू, 50 हजार करोड़ के निवेश का दावा",
      "राज्य सरकार ने नई औद्योगिक निवेश नीति की घोषणा की है, जिसके तहत इंदौर-भोपाल-पीथमपुर बेल्ट में बड़े निवेश की उम्मीद है। जानिए नीति की खास बातें और इसका असर रोजगार पर...",
      seedImg("hero"), "mp-news", "bhopal", 0, 1, "3:25", editor, "-40 minutes"],

    ["सागर में जहरीली शराब कांड: अब तक 22 मौतें, जानिए मिथाइल अल्कोहल शरीर में कैसे जहर फैलाता है",
      "सागर शराब कांड में मिथाइल अल्कोहल की मात्रा 80% पाई गई। जानें कैसे यह केमिकल लिवर और आंखों की रोशनी को नुकसान पहुंचाता है।",
      seedImg(6), "mp-news", "sagar", 1, 0, "2:24", editor, "-1 hour"],

    ["इंदौर की स्टार्टअप ने 19 साल में खड़ा किया 300 करोड़ का ब्रांड, जानिए पूरी कहानी", "", seedImg(7), "business", "indore", 0, 0, null, reporter, "-1 day"],
    ["ग्वालियर कोर्ट का बड़ा फैसला: 5 महीने में 23 मामलों में मृत्युदंड, जानिए वजह", "", seedImg(8), "politics", "gwalior", 0, 0, null, reporter, "-2 days"],

    ["भोपाल में स्मार्ट सिटी प्रोजेक्ट का दूसरा चरण शुरू, 12 चौराहों पर बनेंगे स्काईवॉक", "", seedImg(9), "mp-news", "bhopal", 0, 0, null, editor, "-30 minutes"],
    ["राजधानी में डेंगू के मामले बढ़े: नगर निगम ने शुरू किया फॉगिंग अभियान", "", seedImg(10), "mp-news", "bhopal", 0, 0, null, reporter, "-2 hours"],
    ["इंदौर लगातार 7वीं बार बना देश का सबसे स्वच्छ शहर: स्वच्छता सर्वेक्षण में टॉप रैंकिंग", "", seedImg(11), "mp-news", "indore", 0, 0, null, editor, "-1 hour"],
    ["मेट्रो ट्रायल रन सफल: अगले महीने से यात्रियों के लिए सेवा शुरू होगी", "", seedImg(12), "mp-news", "indore", 0, 0, null, reporter, "-3 hours"],
    ["नर्मदा का जलस्तर बढ़ा, प्रशासन ने निचली बस्तियों में अलर्ट जारी किया", "", seedImg(13), "mp-news", "jabalpur", 1, 0, null, reporter, "-45 minutes"],
    ["जबलपुर में नया स्पोर्ट्स स्टेडियम बनकर तैयार, राष्ट्रीय स्तर की प्रतियोगिताएं होंगी", "", seedImg(14), "sports", "jabalpur", 0, 0, null, editor, "-4 hours"],
    ["ग्वालियर कोर्ट का बड़ा फैसला: भूमि विवाद मामले में ऐतिहासिक निर्णय", "", seedImg(15), "politics", "gwalior", 0, 0, null, editor, "-2 hours"],
    ["ग्वालियर किला परिसर में हुआ भव्य लाइट एंड साउंड शो का शुभारंभ", "", seedImg(16), "mp-news", "gwalior", 0, 0, null, reporter, "-5 hours"],
    ["महाकाल मंदिर में श्रावण मास पर उमड़ा श्रद्धालुओं का सैलाब, विशेष व्यवस्था लागू", "", seedImg(17), "astrology", "ujjain", 0, 0, null, reporter, "-1 hour"],
    ["सिंहस्थ 2028 की तैयारियां तेज: क्षिप्रा नदी सफाई परियोजना को मंजूरी", "", seedImg(18), "mp-news", "ujjain", 0, 0, null, editor, "-3 hours"],
    ["सागर जहरीली शराब कांड: पुलिस ने 6 आरोपियों को किया गिरफ्तार", "", seedImg(19), "politics", "sagar", 1, 0, null, editor, "-30 minutes"],
    ["सागर विश्वविद्यालय में नया इंजीनियरिंग कैंपस शुरू होगा अगले सत्र से", "", seedImg(20), "mp-news", "sagar", 0, 0, null, reporter, "-6 hours"],
    ["रीवा में किसानों का आंदोलन तेज: उचित मुआवजे की मांग को लेकर धरना जारी", "", seedImg(21), "mp-news", "rewa", 0, 0, null, reporter, "-2 hours"],
    ["रीवा एयरपोर्ट से जल्द शुरू होंगी नई उड़ानें, केंद्र सरकार ने दी मंजूरी", "", seedImg(22), "mp-news", "rewa", 0, 0, null, editor, "-5 hours"],

    ["संसद का मानसून सत्र: आज पेश होंगे 5 अहम विधेयक", "", seedImg(23), "national", null, 0, 0, null, editor, "-20 minutes"],
    ["चुनाव आयोग की नई गाइडलाइन, EVM पर बड़ा फैसला", "", seedImg(24), "national", null, 0, 0, null, editor, "-2 hours"],
    ["बांग्लादेश में बाढ़ से हालात गंभीर, राहत कार्य तेज", "", seedImg(25), "world", null, 0, 0, null, reporter, "-3 hours"],

    ["कप्तान तिलक अर्धशतक लगाकर नाबाद: तीसरे दिन साउथ जोन 242/6", "", seedImg(26), "sports", null, 0, 0, "0:46", editor, "-1 hour"],
    ["भारतीय हॉकी टीम नीली जर्सी में खेलेगी एशियन गेम्स", "", seedImg(27), "sports", null, 0, 0, null, reporter, "-2 hours"],
    ["MP प्रीमियर लीग: भोपाल FC ने जीता खिताब मुकाबला", "", seedImg(28), "sports", "bhopal", 0, 0, null, reporter, "-4 hours"],
    ["एशिया कप सेमीफाइनल की तारीख तय, जानें पूरा शेड्यूल", "", seedImg(29), "sports", null, 0, 0, null, editor, "-5 hours"],

    ["10 ग्राम सोना ₹374 महंगा होकर ₹1.53 लाख का हुआ", "", seedImg(30), "business", null, 0, 0, null, editor, "-2 hours"],
    ["अगस्त में इलेक्ट्रिक गाड़ियों की बिक्री 53% बढ़ी, रिकॉर्ड ग्रोथ", "", seedImg(31), "business", null, 0, 0, null, reporter, "-3 hours"],
    ["सेंसेक्स 555 अंक टूटा, बैंकिंग शेयरों में बड़ी गिरावट", "", seedImg(32), "business", null, 0, 0, null, editor, "-6 hours"],
    ["इंदौर-पीथमपुर बेल्ट में 50 हजार करोड़ के निवेश का दावा", "", seedImg(33), "business", "indore", 0, 0, null, editor, "-1 day"],

    ["भोपाल फिल्म फेस्टिवल में दिखी नई हिंदी फिल्मों की झलक", "", seedImg(34), "entertainment", "bhopal", 0, 0, "0:40", reporter, "-1 hour"],
    ["टॉप बॉलीवुड सितारे इंदौर में फिल्म शूट के लिए पहुंचे", "", seedImg(35), "entertainment", "indore", 0, 0, null, reporter, "-3 hours"],
    ["लोकसंगीत महोत्सव: MP के कलाकारों ने बांधा समां", "", seedImg(36), "entertainment", null, 0, 0, null, reporter, "-5 hours"],
    ["नई वेब सीरीज़ में दिखेगी मध्य प्रदेश की लोकेशन", "", seedImg(37), "entertainment", null, 0, 0, null, editor, "-1 day"],

    ["MP पुलिस में 7500 पदों पर भर्ती, आवेदन शुरू", "", seedImg("jobs1"), "jobs", null, 0, 0, null, editor, "0 hours"],
    ["MP बोर्ड 12वीं का रिजल्ट अगले सप्ताह होगा जारी", "", seedImg("jobs2"), "jobs", null, 0, 0, null, editor, "-1 day"],
    ["MPPSC प्री परीक्षा एडमिट कार्ड जारी, ऐसे करें डाउनलोड", "", seedImg("jobs3"), "jobs", null, 0, 0, null, reporter, "-2 days"],

    ["बरसात में बढ़ रहे डेंगू-मलेरिया के केस, बचाव के आसान उपाय", "", seedImg(38), "lifestyle", null, 0, 0, null, reporter, "-2 hours"],
    ["आज का राशिफल: जानें सभी 12 राशियों का हाल", "", seedImg(39), "astrology", null, 0, 0, null, editor, "0 hours"],
    ["श्रावण मास 2026: महत्वपूर्ण तिथियां और पूजा विधि", "", seedImg(40), "astrology", null, 0, 0, null, editor, "-1 day"],
    ["संपादकीय: मध्य प्रदेश में औद्योगिक विकास की नई राह", "", seedImg(41), "opinion", null, 0, 0, null, editor, "-2 days"],
  ];

  for (const a of articles) {
    const [title, summary, image, catSlug, citySlug, breaking, featured, dur, author, offset] = a;
    await db.run(insertArticleSql, [
      title,
      summary,
      image,
      catIds[catSlug] || null,
      citySlug ? cityIds[citySlug] : null,
      breaking,
      featured,
      dur,
      author,
      offset,
    ]);
  }

  console.log("Seed complete.");
  console.log("Login users:");
  console.log("  Super Admin  admin@mpnews.local    / Admin@123");
  console.log("  Editor       editor@mpnews.local   / Editor@123");
  console.log("  Reporter     reporter@mpnews.local / Reporter@123");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
