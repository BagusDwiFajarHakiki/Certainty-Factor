/**
 * Knowledge Base for Quail Breeding Selection (Sistem Pakar Seleksi Bibit Puyuh)
 * Updated: With 'trait' field for dynamic description.
 * Formula: CF = MB - MD
 */

export const SYMPTOMS = [
    { 
        id: 'K01', 
        name: 'Apakah sorot mata burung puyuh terlihat cerah, bening, dan tidak sayu?',
        trait: 'memiliki sorot mata yang cerah dan bening',
        image: 'images/soal-1.png'
    },
    { 
        id: 'K02', 
        name: 'Apakah gerakan burung puyuh lincah, aktif, dan responsif terhadap kejutan?',
        trait: 'gerakannya lincah dan sangat responsif',
        image: 'images/soal-2.png'
    },
    { 
        id: 'K03', 
        name: 'Apakah bulu puyuh terlihat halus, mengkilap, dan tersusun rapi (tidak kusam)?',
        trait: 'bulunya halus, mengkilap, dan rapi',
        image: 'images/soal-3.png'
    },
    { 
        id: 'K04', 
        name: 'Apakah jarak tulang pubis (supit urang) di dekat kloaka terasa lebar (bisa masuk 2-3 jari) dan elastis?',
        trait: 'memiliki tulang pubis yang lebar dan elastis',
        image: 'images/soal-4.png'
    },
    { 
        id: 'K05', 
        name: 'Apakah bentuk dada terlihat lebar, berisi, dan menonjol (berdaging tebal)?',
        trait: 'bagian dada terlihat lebar dan berisi',
        image: 'images/soal-5.png'
    },
    { 
        id: 'K06', 
        name: 'Apakah postur tubuh terlihat besar dan berat badannya di atas 170 gram (terlihat gemuk/berlemak)?',
        trait: 'postur tubuhnya besar dengan bobot signifikan',
        image: 'images/soal-6.png'
    },
    { 
        id: 'K07', 
        name: 'Apakah bentuk perut terasa lunak dan halus saat diraba (tidak keras/bengkak)?',
        trait: 'perutnya terasa lunak dan halus',
        image: 'images/soal-7.png'
    },
    { 
        id: 'K08', 
        name: 'Apakah sayap terlihat menggantung lemah dan puyuh sering memejamkan mata (mengantuk)?',
        trait: 'sayapnya tampak menggantung lemah',
        image: 'images/soal-8.png'
    },
    { 
        id: 'K09', 
        name: 'Apakah area kloaka (dubur) terlihat kotor, basah, atau berkerak putih/hijau?',
        trait: 'area kloaka terlihat kotor atau tidak normal',
        image: 'images/soal-9.png'
    }
];

export const HYPOTHESES = [
    { 
        id: 'P01', 
        name: 'Puyuh Petelur (Layer)', 
        description: 'Puyuh ini didiagnosa sebagai Petelur unggul karena teridentifikasi',
        recommendation: 'Sangat direkomendasikan sebagai indukan utama. Segera masukkan ke kandang produksi, berikan pakan layer protein tinggi (18-20%), dan atur pencahayaan 16 jam untuk memicu produktivitas.'
    },
    { 
        id: 'P02', 
        name: 'Puyuh Pedaging (Broiler)', 
        description: 'Puyuh ini lebih cocok sebagai Pedaging karena teridentifikasi',
        recommendation: 'Cocok dijadikan indukan penghasil anakan pedaging atau langsung dipanen dagingnya. Jika ingin dijadikan indukan, batasi porsi pakan agar tidak terlalu gemuk yang dapat menghambat pembuahan.'
    },
    { 
        id: 'P03', 
        name: 'Tidak Layak / Afkir', 
        description: 'Puyuh ini dianggap Tidak Layak karena teridentifikasi',
        recommendation: 'Jangan dimasukkan ke kandang koloni. Segera isolasi (karantina) untuk mencegah penularan penyakit. Lakukan culling (pemusnahan) jika sakit, atau jual sebagai puyuh afkir jika hanya cacat fisik namun sehat.'
    }
];

/**
 * Rules based on Industrial Standards.
 * MB (Measure of Belief): Supports the hypothesis.
 * MD (Measure of Disbelief): Disproves the hypothesis.
 */
export const RULES = [
    // K01: Apakah sorot mata burung puyuh terlihat cerah, bening, dan tidak sayu?
    { symptomId: 'K01', hypothesisId: 'P01', mb: 0.8, md: 0.1 },
    { symptomId: 'K01', hypothesisId: 'P02', mb: 0.8, md: 0.2 },
    { symptomId: 'K01', hypothesisId: 'P03', mb: 0.3, md: 0.2 },

    // K02: Apakah gerakan burung puyuh lincah, aktif, dan responsif terhadap kejutan?
    { symptomId: 'K02', hypothesisId: 'P01', mb: 0.9, md: 0.1 },
    { symptomId: 'K02', hypothesisId: 'P02', mb: 0.8, md: 0.2 },
    { symptomId: 'K02', hypothesisId: 'P03', mb: 0.3, md: 0.1 },

    // K03: Apakah bulu puyuh terlihat halus, mengkilap, dan tersusun rapi (tidak kusam)?
    { symptomId: 'K03', hypothesisId: 'P01', mb: 0.8, md: 0.2 },
    { symptomId: 'K03', hypothesisId: 'P02', mb: 0.8, md: 0.2 },
    { symptomId: 'K03', hypothesisId: 'P03', mb: 0.3, md: 0.2 },

    // K04: Apakah jarak tulang pubis (supit urang) di dekat kloaka terasa lebar (bisa masuk 2-3 jari) dan elastis?
    { symptomId: 'K04', hypothesisId: 'P01', mb: 0.9, md: 0.1 },
    { symptomId: 'K04', hypothesisId: 'P02', mb: 0.3, md: 0.5 },

    // K05: Apakah bentuk dada terlihat lebar, berisi, dan menonjol (berdaging tebal)?
    { symptomId: 'K05', hypothesisId: 'P01', mb: 0.6, md: 0.7 },
    { symptomId: 'K05', hypothesisId: 'P02', mb: 0.9, md: 0.1 },

    // K06: Apakah postur tubuh terlihat besar dan berat badannya di atas 170 gram (terlihat gemuk/berlemak)?
    { symptomId: 'K06', hypothesisId: 'P01', mb: 0.4, md: 0.6 },
    { symptomId: 'K06', hypothesisId: 'P02', mb: 0.9, md: 0.2 },

    // K07: Apakah bentuk perut terasa lunak dan halus saat diraba (tidak keras/bengkak)?
    { symptomId: 'K07', hypothesisId: 'P01', mb: 0.8, md: 0.2 },
    { symptomId: 'K07', hypothesisId: 'P02', mb: 0.4, md: 0.6 },

    // K08: Apakah sayap terlihat menggantung lemah dan puyuh sering memejamkan mata (mengantuk)?
    { symptomId: 'K08', hypothesisId: 'P01', mb: 0.3, md: 0.6 },
    { symptomId: 'K08', hypothesisId: 'P02', mb: 0.3, md: 0.6 },
    { symptomId: 'K08', hypothesisId: 'P03', mb: 0.9, md: 0.1 },

    // K09: Apakah area kloaka (dubur) terlihat kotor, basah, atau berkerak putih/hijau?
    { symptomId: 'K09', hypothesisId: 'P01', mb: 0.3, md: 0.6 },
    { symptomId: 'K09', hypothesisId: 'P02', mb: 0.3, md: 0.6 },
    { symptomId: 'K09', hypothesisId: 'P03', mb: 0.9, md: 0.2 },
];
