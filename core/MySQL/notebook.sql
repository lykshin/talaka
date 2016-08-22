DROP TABLE IF EXISTS `notebook`;
CREATE TABLE IF NOT EXISTS `notebook` (
`id` int(11) NOT NULL,
  `client` varchar(8) COLLATE utf8_bin DEFAULT NULL,
  `title` tinytext COLLATE utf8_bin,
  `description` text COLLATE utf8_bin,
  `important` tinyint(1) NOT NULL DEFAULT '0',
  `dateCreate` int(11) NOT NULL DEFAULT '0',
  `dateUpdate` int(11) NOT NULL DEFAULT '0'
) ENGINE=Aria AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_bin PAGE_CHECKSUM=0 TRANSACTIONAL=0;

ALTER TABLE `notebook`
ADD PRIMARY KEY (`id`), ADD KEY `client` (`client`);