/**
 * Языки: коды ISO 639-1 без мёртвых и искусственных (латынь, санскрит, эсперанто и т. п.)
 * и без тех, чьих английских названий нет в Chrome: его `Intl.DisplayNames` вернул бы вместо
 * названия код (`ab`, `ba`). Английские названия даёт `getLanguageName`.
 */
export const languageCodes: readonly string[] = (
  "af ak am an ar as ay az be bg bm bn br bs ca co cs cy da de dv ee el en es et eu fa fi fo fr " +
  "fy ga gd gl gn gu ha he hi hr ht hu hy id ig is it ja jv ka kk km kn ko ku ky lb lg ln lo lt " +
  "lv mg mi mk ml mn mr ms mt my nb ne nl nn no ny oc om or pa pl ps pt qu rm ro ru rw sd si sk " +
  "sl sm sn so sq sr st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ug uk ur uz vi wa wo xh " +
  "yi yo zh zu"
).split(" ");
