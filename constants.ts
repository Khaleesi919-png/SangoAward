
import { DominionStatus } from './types';

export const INITIAL_SEASONS = ['S20', 'S21', 'S22', 'S23', 'S24', 'S25', 'S26'];

export const STATUS_COLORS: Record<DominionStatus, string> = {
  [DominionStatus.EMPTY]: 'bg-slate-800/20 text-slate-500 border-slate-800',
  [DominionStatus.CURRENT_DOMINION]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 font-bold glow-text',
  [DominionStatus.RECEIVED]: 'bg-green-500/20 text-green-400 border-green-500/50',
  [DominionStatus.GUARANTEED]: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 animate-pulse font-bold',
  [DominionStatus.RECEIVED_NO_GUARANTEE]: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  [DominionStatus.LEFT_TEAM]: 'bg-rose-500/20 text-rose-400 border-rose-500/50 line-through',
  [DominionStatus.QUIT]: 'bg-slate-700/40 text-slate-400 border-slate-600 italic'
};

export const SQUAD_GROUPS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export const PRESET_MEMBER_NAMES = [
  "銀髮蒼蒼", "甜言蜜語", "CAKE", "魏槿", "阿胖", "雞貝泥", "MY丨蟹蟹", "新垣承宇", 
  "鵝成章麻子", "融融丨大麥克", "飛丨嗨嗨嗨", "兲丨蛋(蛙哥)", "冰炫風加小石", "阿益", 
  "小一哥", "兲｜Q", "焦糖冰炫風起", "傲慢の罪面面", "昊羲丨長白", "影", "慕成霧", 
  "魚柳包丨柄野", "艾那", "慕成雨", "sp大都督", "糖醋醬黑機杯", "烏子明", "寧希", 
  "瀨戶環奈", "不理小象", "暴食の罪富富", "九頭魔神金閃", "敬洛丨渝喬", "揚浩怡", 
  "杜士逸", "保持", "兲丨大刀", "阿北丨木屐咖", "羊肉滿福堡", "疯小子", "無界丨河馬", 
  "麥胞丨小薄荷", "麥胞丨柳柳柳", "兲丨魚觀海", "麥胞丨小薯", "Bigke", "李仲殲", 
  "二郎", "KAMO", "一念繾卷", "割鬚丨龐煖", "高尚ㅣNTR", "小貓", "水流雲", "弱女子", 
  "青州希望", "丹陽競日", "飛熊哈爾", "解煩檸檬魚", "王羲之", "李嘉誠象", "浪漫錦帆", 
  "白馬肆月泱", "白毦柔柔", "栗栗丸子", "無當天雲", "藤甲占咪", "大戟子逸", "虎衛里昂", "西涼夕夫"
];
