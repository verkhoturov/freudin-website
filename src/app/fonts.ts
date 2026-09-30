import { Geist } from "next/font/google";

// Шрифты сайта подключаются только здесь, их же берёт Storybook. next/font принимает в вызове
// только литералы, поэтому сменить шрифт — поменять импорт и вызов, а не значение в globals.css.
// Кириллица обязательна: имена и описания пользователей бывают на любом языке
const sans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

/** Классы с переменными шрифтов для `<html>`: их читает раздел «Шрифты» в globals.css. */
export const fontVariables = sans.variable;
