/**
 * AI Quiz Generator — Xulosa matnidan savollar yaratish
 * 5 ta MCQ + 3 ta True/False + 2 ta qisqa javobli savol
 */

function generateQuiz(xulosa, kitobNomi, muallif) {
    const jumlalar = xulosa
        .replace(/([.!?])\s+/g, '$1|')
        .split('|')
        .map(s => s.trim())
        .filter(s => s.length > 10);

    const savollar = [];

    // 5 ta Multiple Choice savollar
    for (let i = 0; i < 5; i++) {
        const jumla = jumlalar[i % jumlalar.length] || `"${kitobNomi}" kitobi haqida`;
        const sozlar = jumla.split(/\s+/).filter(s => s.length > 3);
        const kalit = sozlar[Math.floor(Math.random() * sozlar.length)] || kitobNomi;

        savollar.push({
            id: i + 1,
            turi: 'mcq',
            savol: `Quyidagi gapda bo'sh joyni to'ldiring: "${jumla.replace(kalit, '___')}"`,
            variantlar: shuffleArray([
                kalit,
                sozlar[0] || 'kitob',
                sozlar[sozlar.length - 1] || 'muallif',
                generateFakeWord(kalit),
            ]),
            togri_javob: kalit,
        });
    }

    // 3 ta True/False savollar
    for (let i = 0; i < 3; i++) {
        const jumla = jumlalar[(i + 5) % jumlalar.length] || `"${kitobNomi}" muallifi ${muallif}`;
        const isTrue = Math.random() > 0.5;

        savollar.push({
            id: i + 6,
            turi: 'tf',
            savol: isTrue
                ? `To'g'ri yoki noto'g'ri: "${jumla}"`
                : `To'g'ri yoki noto'g'ri: "${modifySentence(jumla)}"`,
            togri_javob: isTrue ? "to'g'ri" : "noto'g'ri",
        });
    }

    // 2 ta qisqa javobli savollar
    savollar.push({
        id: 9,
        turi: 'short',
        savol: `"${kitobNomi}" kitobining muallifi kim?`,
        togri_javob: muallif,
    });

    const oxirgiJumla = jumlalar[jumlalar.length - 1] || xulosa.substring(0, 100);
    savollar.push({
        id: 10,
        turi: 'short',
        savol: `Kitobning asosiy g'oyasi nima? Qisqacha javob bering.`,
        togri_javob: oxirgiJumla,
    });

    return savollar;
}

function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function generateFakeWord(original) {
    const prefixes = ['anti', 'sub', 'pre', 'post'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix + original.substring(0, Math.min(4, original.length));
}

function modifySentence(sentence) {
    const words = sentence.split(' ');
    if (words.length > 3) {
        const idx = Math.floor(Math.random() * (words.length - 2)) + 1;
        words[idx] = words[idx + 1] || words[idx - 1] || 'boshqa';
    }
    return words.join(' ');
}

module.exports = { generateQuiz };
