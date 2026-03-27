import { Client } from '@notionhq/client';

const notion = new Client({
auth: process.env.NOTION_TOKEN
});

/**
 * Notion のスラッグ形式の絵文字（:chart_increasing:）を絵文字（📈）に変換
 */
const emojiMap = {
  'chart_increasing': '📈',
  'chart': '📊',
  'book': '📖',
  'bulb': '💡',
  'rocket': '🚀',
  'star': '⭐',
  'fire': '🔥',
  'check': '✅',
  'x': '❌',
  'warning': '⚠️',
  'info': 'ℹ️',
  'heart': '❤️',
  'thumbsup': '👍',
  'thumbsdown': '👎',
  'rocket': '🚀',
  'sparkles': '✨',
  'bulb': '💡',
  'light_bulb': '💡',
  'page': '📄',
  'document': '📄',
  'text': '📝',
  'memo': '📝',
  'pencil': '✏️',
  'edit': '✏️',
  'search': '🔍',
  'magnifying_glass': '🔍',
  'gear': '⚙️',
  'settings': '⚙️',
  'lock': '🔒',
  'unlock': '🔓',
  'key': '🔑',
  'shield': '🛡️',
  'security': '🛡️',
  'calendar': '📅',
  'date': '📅',
  'clock': '🕐',
  'time': '🕐',
  'bell': '🔔',
  'notification': '🔔',
  'email': '📧',
  'mail': '📧',
  'envelope': '✉️',
  'phone': '📞',
  'call': '📞',
  'mobile_phone': '📱',
  'computer': '💻',
  'laptop': '💻',
  'desktop': '🖥️',
  'screen': '🖥️',
  'printer': '🖨️',
  'camera': '📷',
  'video_camera': '📹',
  'film': '🎬',
  'movie': '🎬',
  'music': '🎵',
  'note': '🎵',
  'radio': '📻',
  'speaker': '🔊',
  'headphone': '🎧',
  'game': '🎮',
  'controller': '🎮',
  'dice': '🎲',
  'trophy': '🏆',
  'medal': '🏅',
  'award': '🏅',
  'gift': '🎁',
  'present': '🎁',
  'balloon': '🎈',
  'party': '🎉',
  'tada': '🎉',
  'confetti': '🎊',
  'flower': '🌸',
  'rose': '🌹',
  'sunflower': '🌻',
  'blossom': '🌼',
  'tulip': '🌷',
  'leaf': '🍃',
  'tree': '🌳',
  'evergreen_tree': '🌲',
  'palm_tree': '🌴',
  'cactus': '🌵',
  'mushroom': '🍄',
  'chestnut': '🌰',
  'bread': '🍞',
  'cheese': '🧀',
  'meat': '🍖',
  'poultry_leg': '🍗',
  'bacon': '🥓',
  'hamburger': '🍔',
  'fries': '🍟',
  'pizza': '🍕',
  'hotdog': '🌭',
  'taco': '🌮',
  'burrito': '🌯',
  'egg': '🥚',
  'cooking': '🍳',
  'pan': '🍳',
  'shallow_pan_of_food': '🥘',
  'stew': '🍲',
  'salad': '🥗',
  'popcorn': '🍿',
  'rice': '🍚',
  'curry': '🍛',
  'ramen': '🍜',
  'spaghetti': '🍝',
  'sweet_potato': '🍠',
  'oden': '🍢',
  'sushi': '🍣',
  'fried_shrimp': '🍤',
  'fish_cake': '🍥',
  'dango': '🍡',
  'dumpling': '🥟',
  'fortune_cookie': '🥠',
  'takeout_box': '🥡',
  'crab': '🦀',
  'shrimp': '🦐',
  'squid': '🦑',
  'icecream': '🍦',
  'shaved_ice': '🍧',
  'ice_cream': '🍨',
  'doughnut': '🍩',
  'cookie': '🍪',
  'birthday': '🎂',
  'cake': '🍰',
  'cupcake': '🧁',
  'pie': '🥧',
  'chocolate_bar': '🍫',
  'candy': '🍬',
  'lollipop': '🍭',
  'custard': '🍮',
  'honey_pot': '🍯',
  'baby_bottle': '🍼',
  'milk': '🥛',
  'coffee': '☕',
  'tea': '🍵',
  'sake': '🍶',
  'champagne': '🍾',
  'wine_glass': '🍷',
  'cocktail': '🍸',
  'tropical_drink': '🍹',
  'beer': '🍺',
  'beers': '🍻',
  'clinking_glasses': '🥂',
  'tumbler_glass': '🥃',
  'cup_with_straw': '🥤',
  'beverage_box': '🧃',
  'garlic': '🧄',
  'onion': '🧅',
  'potato': '🥔',
  'carrot': '🥕',
  'corn': '🌽',
  'hot_pepper': '🌶️',
  'cucumber': '🥒',
  'leafy_greens': '🥬',
  'broccoli': '🥦',
  'tomato': '🍅',
  'eggplant': '🍆',
  'avocado': '🥑',
  'butter': '🧈',
  'mushroom': '🍄',
  'peanuts': '🥜',
  'kiwifruit': '🥝',
  'strawberry': '🍓',
  'melon': '🍈',
  'watermelon': '🍉',
  'grapes': '🍇',
  'blueberries': '🫐',
  'lemon': '🍋',
  'banana': '🍌',
  'pineapple': '🍍',
  'mango': '🥭',
  'apple': '🍎',
  'green_apple': '🍏',
  'pear': '🍐',
  'peach': '🍑',
  'cherries': '🍒',
  'orange': '🍊',
  'tangerine': '🍊',
  'mandarin': '🍊',
  'apricot': '🍑',
  'plum': '🫐',
  'coconut': '🥥',
  'kiwi': '🥝',
  'pineapple': '🍍',
  'mango': '🥭',
  'red_apple': '🍎',
  'green_apple': '🍏',
  'pear': '🍐',
  'peach': '🍑',
  'cherries': '🍒',
  'strawberry': '🍓',
  'blueberries': '🫐',
  'tangerine': '🍊',
  'lemon': '🍋',
  'banana': '🍌',
  'pineapple': '🍍',
  'apple': '🍎',
  'orange': '🍊',
  'mango': '🥭',
  'watermelon': '🍉',
  'grapes': '🍇',
  'melon': '🍈',
  'kiwifruit': '🥝',
  'tomato': '🍅',
  'olive': '🫒',
  'coconut': '🥥',
  'avocado': '🥑',
  'eggplant': '🍆',
  'potato': '🥔',
  'carrot': '🥕',
  'corn': '🌽',
  'hot_pepper': '🌶️',
  'cucumber': '🥒',
  'leafy_greens': '🥬',
  'broccoli': '🥦',
  'mushroom': '🍄',
  'peanuts': '🥜',
  'chestnut': '🌰',
  'bread': '🍞',
  'croissant': '🥐',
  'baguette_bread': '🥖',
  'flatbread': '🫓',
  'pretzel': '🥨',
  'bagel': '🥯',
  'pancakes': '🥞',
  'waffle': '🧇',
  'cheese': '🧀',
  'meat_on_bone': '🍖',
  'poultry_leg': '🍗',
  'bacon': '🥓',
  'hamburger': '🍔',
  'fries': '🍟',
  'pizza': '🍕',
  'hotdog': '🌭',
  'sandwich': '🥪',
  'taco': '🌮',
  'burrito': '🌯',
  'stuffed_flatbread': '🥙',
  'egg': '🥚',
  'cooking': '🍳',
  'shallow_pan_of_food': '🥘',
  'pot_of_food': '🍲',
  'bowl_with_spoon': '🥣',
  'green_salad': '🥗',
  'popcorn': '🍿',
  'butter': '🧈',
  'salt': '🧂',
  'canned_food': '🥫',
  'bento': '🍱',
  'rice_cracker': '🍘',
  'rice_ball': '🍙',
  'rice': '🍚',
  'curry_rice': '🍛',
  'steaming_bowl': '🍜',
  'spaghetti': '🍝',
  'roasted_sweet_potato': '🍠',
  'oden': '🍢',
  'sushi': '🍣',
  'fried_shrimp': '🍤',
  'fish_cake_with_swirl': '🍥',
  'moon_cake': '🥮',
  'dango': '🍡',
  'dumpling': '🥟',
  'fortune_cookie': '🥠',
  'takeout_box': '🥡',
  'soft_ice_cream': '🍦',
  'shaved_ice': '🍧',
  'ice_cream': '🍨',
  'doughnut': '🍩',
  'cookie': '🍪',
  'birthday_cake': '🎂',
  'shortcake': '🍰',
  'cupcake': '🧁',
  'pie': '🥧',
  'chocolate_bar': '🍫',
  'candy': '🍬',
  'lollipop': '🍭',
  'custard': '🍮',
  'honey_pot': '🍯',
  'baby_bottle': '🍼',
  'glass_of_milk': '🥛',
  'hot_beverage': '☕',
  'teacup_without_handle': '🍵',
  'sake': '🍶',
  'bottle_with_popping_cork': '🍾',
  'wine_glass': '🍷',
  'cocktail_glass': '🍸',
  'tropical_drink': '🍹',
  'beer_mug': '🍺',
  'clinking_beer_mugs': '🍻',
  'clinking_glasses': '🥂',
  'tumbler_glass': '🥃',
  'cup_with_straw': '🥤',
  'bubble_tea': '🧋',
  'beverage_box': '🧃',
  'ice_cube': '🧊',
  'wavy_dash': '〰️',
  'check_mark': '✔️',
  'check_mark_button': '✅',
  'cross_mark': '❌',
  'cross_mark_button': '❎',
  'heavy_plus_sign': '➕',
  'heavy_minus_sign': '➖',
  'heavy_division_sign': '➗',
  'curly_loop': '➰',
  'double_curly_loop': '➿',
  'recycle': '♻️',
  'fleur_de_lis': '⚜️',
  'trident': '🔱',
  'name_badGE': '📛',
  'japanese_symbol_of_beginner': '🔰',
  'circle_with_letter': '⭕',
  'white_check_mark': '✅',
  'ballot_box_with_check': '☑️',
  'heavy_check_mark': '✔️',
  'heavy_multiplication_x': '✖️',
  'sparkle': '❇️',
  'eight_spoked_asterisk': '✳️',
  'eight_pointed_black_star': '✴️',
  'sparkles': '✨',
  'copyright': '©️',
  'registered': '®️',
  'trade_mark': '™️',
  'keycap_star': '*️⃣',
  'keycap_0': '0️⃣',
  'keycap_1': '1️⃣',
  'keycap_2': '2️⃣',
  'keycap_3': '3️⃣',
  'keycap_4': '4️⃣',
  'keycap_5': '5️⃣',
  'keycap_6': '6️⃣',
  'keycap_7': '7️⃣',
  'keycap_8': '8️⃣',
  'keycap_9': '9️⃣',
  'keycap_ten': '🔟',
  'input_latin_uppercase': '🔠',
  'input_latin_lowercase': '🔡',
  'input_numbers': '🔢',
  'input_symbols': '🔣',
  'input_latin_letters': '🔤',
  'a': '🅰️',
  'ab': '🆎',
  'b': '🅱️',
  'cl': '🆑',
  'cool': '🆒',
  'free': '🆓',
  'information_source': 'ℹ️',
  'id': '🆔',
  'm': 'Ⓜ️',
  'new': '🆕',
  'ng': '🆖',
  'o': '🅾️',
  'ok': '🆗',
  'p': '🅿️',
  'sos': '🆘',
  'up': '🆙',
  'vs': '🆚',
  'japanese_here': '🈁',
  'japanese_service_charge': '🈂️',
  'japanese_monthly_amount': '🈷️',
  'japanese_vacancy': '🈶',
  'japanese_not_free_of_charge': '🈚',
  'japanese_reserved': '🈯',
  'japanese_bargain': '🉐',
  'japanese_discount': '🈹',
  'japanese_free_of_charge': '🈚',
  'japanese_open_for_business': '🈺',
  'japanese_no_vacancy': '🈵',
  'japanese_acceptable': '🉑',
  'japanese_prohibited': '🚫',
  'japanese_admission_tickets': '🎟️',
  'japanese_coupon': '🎫',
  'japanese_winner': '🏆',
  'japanese_first_place': '🥇',
  'japanese_second_place': '🥈',
  'japanese_third_place': '🥉',
  'japanese_trophy': '🏅',
  'japanese_medal': '🎖️',
  'japanese_military_medal': '🎖️',
  'japanese_certificate': '🎗️',
  'japanese_ticket': '🎫',
  'japanese_admission_tickets': '🎟️',
  'japanese_bargain': '🉐',
  'japanese_discount': '🈹',
  'japanese_acceptable': '🉑',
  'japanese_reserved': '🈯',
  'japanese_vacancy': '🈶',
  'japanese_not_free_of_charge': '🈚',
  'japanese_service_charge': '🈂️',
  'japanese_monthly_amount': '🈷️',
  'japanese_here': '🈁',
  'japanese_open_for_business': '🈺',
  'japanese_no_vacancy': '🈵',
  'japanese_prohibited': '🚫'
};

/**
 * スラッグ形式の絵文字を絵文字に変換
 * @param {string} slug - スラッグ形式の絵文字（例：':chart_increasing:'）
 * @returns {string} - 絵文字
 */
function convertEmojiSlug(slug) {
  if (!slug) return '📝';
  
  // : で囲まれている場合は外す
  const cleanSlug = slug.replace(/^:|:$/g, '');
  
  // マップから絵文字を取得
  if (emojiMap[cleanSlug]) {
    return emojiMap[cleanSlug];
  }
  
  // マップにない場合は元のスラッグを返す
  return slug;
}

/**
 * Notionデータベースから公開フラグが true のレコードを取得
 */
export async function getPublishedArticles(databaseId, options = {}) {
  const { testMode = false, limit = null } = options;

  try {
    let hasMore = true;
    let startCursor = undefined;
    const articles = [];

    while (hasMore) {
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          or: [
            {
              property: 'Published',
              checkbox: {
                equals: true
              }
            },
            {
              property: 'Commit',
              checkbox: {
                equals: true
              }
            }
          ]
        },
        sorts: [
          {
            timestamp: 'last_edited_time',
            direction: 'descending'
          }
        ],
        start_cursor: startCursor
      });

      articles.push(...response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor;

      // テストモード時は最初のページのみ取得
      if (testMode) break;
    }

    // リミット適用
    if (limit) {
      return articles.slice(0, limit);
    }

    return articles;
  } catch (error) {
    console.error('Failed to fetch articles from Notion:', error);
    throw error;
  }
}

/**
 * Notionページからメタデータを抽出
 */
export function extractMetadata(page) {
const properties = page.properties;

// デバッグ：Topics プロパティの構造を確認
console.log('=== Topics Property Debug ===');
console.log('Full Topics object:', JSON.stringify(properties.Topics, null, 2));

// Topics プロパティの構造を柔軟に処理
let topics = [];
if (properties.Topics) {
  if (Array.isArray(properties.Topics.multi_select)) {
    topics = properties.Topics.multi_select.map(t => t.name);
    console.log('Extracted from multi_select array:', topics);
  } else if (properties.Topics.type === 'multi_select' && Array.isArray(properties.Topics[properties.Topics.type])) {
    topics = properties.Topics[properties.Topics.type].map(t => t.name);
    console.log('Extracted from type-based array:', topics);
  } else {
    console.log('Topics structure not recognized, using empty array');
  }
}
console.log('Final topics:', topics);
console.log('=========================');

return {
id: page.id,
title: properties.Title?.title?.[0]?.plain_text || '',
slug: properties.Slug?.rich_text?.[0]?.plain_text || '',
emoji: convertEmojiSlug(properties.Emoji?.select?.name),
type: properties.Type?.select?.name || 'tech',
topics: topics,
platforms: properties.Platform?.multi_select?.map(p => p.name) || [],
published: properties.Published?.checkbox || false,
commit: properties.Commit?.checkbox || false,
lastEditedTime: page.last_edited_time,
createdTime: page.created_time
};
}

/**
 * ページIDから完全な内容を取得
 */
export async function getPageContent(pageId) {
  try {
    const page = await notion.blocks.retrieve({
      block_id: pageId
    });
    return page;
  } catch (error) {
    console.error(`Failed to fetch page content for ${pageId}:`, error);
    throw error;
  }
}
