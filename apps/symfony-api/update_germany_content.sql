-- Update Germany with real content
INSERT INTO country_text (country_id, section, lang, content) VALUES 
(2, 'overview', 'en', 'Germany, officially the Federal Republic of Germany, is a country in Central Europe. It is the second-most populous country in Europe after Russia, and the most populous member state of the European Union. Germany is situated between the Baltic and North seas to the north, and the Alps to the south; it covers an area of 357,022 square kilometres, with a population of over 83 million within its 16 constituent states.')
ON CONFLICT (country_id, section, lang) DO UPDATE SET content = EXCLUDED.content;

INSERT INTO country_text (country_id, section, lang, content) VALUES 
(2, 'culture', 'en', 'German culture has been shaped by major intellectual and popular currents in Europe, both religious and secular. Historically, Germany has been called Das Land der Dichter und Denker (the country of poets and thinkers). German literature can be traced back to the Middle Ages, with the most notable authors of the period being Walther von der Vogelweide and Wolfram von Eschenbach. The Nibelungenlied, whose author remains unknown, is also an important work of the epoch, as is the Thidrekssaga.')
ON CONFLICT (country_id, section, lang) DO UPDATE SET content = EXCLUDED.content;

INSERT INTO country_text (country_id, section, lang, content) VALUES 
(2, 'economy', 'en', 'Germany has a social market economy with a highly skilled labour force, a large capital stock, a low level of corruption, and a high level of innovation. It is the world''s third-largest exporter of goods, and has the largest economy in Europe, which is also the world''s fourth-largest economy by nominal GDP, and the fifth-largest by PPP. Its GDP per capita measured in purchasing power standards amounts to 121% of the EU27 average.')
ON CONFLICT (country_id, section, lang) DO UPDATE SET content = EXCLUDED.content;

INSERT INTO country_text (country_id, section, lang, content) VALUES 
(2, 'history', 'en', 'The concept of Germany as a distinct region in Central Europe can be traced to Roman commander Julius Caesar, who referred to the unconquered area east of the Rhine as Germania, thus distinguishing it from Gaul. The victory of the Germanic tribes in the Battle of the Teutoburg Forest (AD 9) prevented annexation by the Roman Empire. Following the fall of the Western Roman Empire, the Franks conquered the other West Germanic tribes. When the Frankish Empire was divided among Charlemagne''s heirs in 843, the eastern part became East Francia.')
ON CONFLICT (country_id, section, lang) DO UPDATE SET content = EXCLUDED.content;

INSERT INTO country_text (country_id, section, lang, content) VALUES 
(2, 'demography', 'en', 'With a population of 83.2 million inhabitants, Germany is the most populous country in the European Union, the second most populous country in Europe after Russia, and the nineteenth most populous country in the world. Its population density stands at 233 inhabitants per square kilometre. The overall life expectancy in Germany at birth is 81.1 years (78.7 years for males and 83.6 years for females). The fertility rate of 1.57 children born per woman is below the replacement rate of 2.1 and is one of the lowest fertility rates in the world.')
ON CONFLICT (country_id, section, lang) DO UPDATE SET content = EXCLUDED.content;
