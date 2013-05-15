<?xml version="1.0" encoding="iso-8859-1"?>
<xsl:stylesheet	version="1.0"
				xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
				xmlns:msxsl="urn:schemas-microsoft-com:xslt"
				xmlns:erik="http://webgraphics.corp.smb.com"
				exclude-result-prefixes="msxsl">

	<xsl:output method="html" indent="yes" encoding="iso-8859-1"/>
	
		<!-- get url of xml document -->
	<xsl:variable name="xmlpath" select="erik:getUrl(.)" />
	
		<!-- get window.location.search for xml document -->
	<xsl:variable name="search">
	     <xsl:if test="contains($xmlpath,'?')">
	          <xsl:call-template name="search">
	               <xsl:with-param name="raw" select="substring-after($xmlpath,'?')" />
	          </xsl:call-template>
	     </xsl:if>
	</xsl:variable>

	<msxsl:script language="javascript" implements-prefix="erik"><![CDATA[
	function getUrl(nodelist)
	{
		return nodelist.nextNode().url;
	}
	]]></msxsl:script>

	<xsl:template match="/">
	
			<!-- get query string values from the msxsl:node-set already generated in the "search" template below -->
		<xsl:variable name="of"><xsl:value-of select="msxsl:node-set($search)/*[1]/@value" /></xsl:variable>
		<xsl:variable name="dir"><xsl:value-of select="msxsl:node-set($search)/*[2]/@value" /></xsl:variable>
		<xsl:variable name="dt"><xsl:value-of select="msxsl:node-set($search)/*[3]/@value" /></xsl:variable>

		<html>
			<head>
				<title>Data Reporting Demo</title>
				<link href="../css/job_tracker.css" rel="stylesheet" type="text/css"/>
				<script language="JavaScript" src="/job_tracker/script/view.js"></script>
			</head>
			
			<body>
				<xsl:attribute name="onload">keepFrameScrollingTogether(); window.top.main.main_top.highlightOrderedField('<xsl:value-of select="$of"/>', '<xsl:value-of select="$dir"/>'); writeRadioBtns();</xsl:attribute>
				<table style="table-layout:fixed" border="1" cellpadding="1" cellspacing="0" rules="cols" frame="void" bordercolorlight="#FFFFFF" bordercolordark="#000066" id="mainContentTable">
					<form action="" method="post" name="job_form">
					
						<xsl:for-each select="root/col_info/col">
							<col>
								<xsl:attribute name="class"><xsl:value-of select="@class"/></xsl:attribute>
								<xsl:attribute name="style"><xsl:value-of select="@style"/></xsl:attribute>
							</col>
						</xsl:for-each>
				
						<tbody class="ssrow">
						
							<xsl:for-each select="root/record">
								<xsl:sort select="*[name() = $of]" order="{$dir}" data-type="{$dt}" />
								<xsl:sort select="job_name" order="ascending" data-type="text" />
								
								<tr valign="top">
										<!-- put gray background for every other row -->
									<xsl:choose>
										<xsl:when test="position() mod 2 = 0">
											<xsl:attribute name="class">dtr0</xsl:attribute>
										</xsl:when>
										<xsl:otherwise>
											<xsl:attribute name="class">dtr1</xsl:attribute>
										</xsl:otherwise>
									</xsl:choose>
									<xsl:attribute name="id">row<xsl:value-of select="@db_id"/></xsl:attribute>
						
									<xsl:for-each select="*">
										<td>
											<xsl:if test="@class[.!='']">
												<xsl:attribute name="class"><xsl:value-of select="@class"/></xsl:attribute>
											</xsl:if>
											
											<xsl:choose>
													<!-- wrap longtext fields with textarea -->
												<xsl:when test="@class[.='longtext'] and self::node()[.!='&#160;']">
													<textarea class="ssrow" cols="14" rows="2" readonly="readonly"><xsl:value-of select="."/></textarea>
												</xsl:when>
												<xsl:when test="@class[.='name'] and @email[.!=''] and self::node()[.!='&#160;']">
														<a>
															<xsl:attribute name="href">
																<xsl:text>mailto:</xsl:text> 
																<xsl:value-of select="@email"/>
															</xsl:attribute>
														<xsl:value-of select="."/>
														</a>
												</xsl:when>
													<!-- format money -->
												<xsl:when test="@class[.='moneyData']">
													$<xsl:value-of select='format-number(., "###,###.00")' />
												</xsl:when>
												<xsl:otherwise>
													<xsl:value-of select="."/>
												</xsl:otherwise>
											</xsl:choose>
										</td>
									</xsl:for-each>
								</tr>
							</xsl:for-each>
						</tbody>
					</form>
				</table>
				<!--
				<a href="javascript:alert(document.body.innerHTML)">view html</a>
				-->
			</body>
		</html>
	</xsl:template>
	
		<!-- parse the query string and build an msxsl:node-set with all the name/value pairs -->
	<xsl:template name="search">
		<xsl:param name="raw" />
		<xsl:if test="$raw and contains($raw,'=')">
			<xsl:choose>
				<xsl:when test="contains($raw,'&amp;')">
					<xsl:variable name="name" select="substring-before($raw,'=')" />
					<xsl:variable name="value" select="substring-after(substring-before($raw,'&amp;'),'=')" />
					<parameter name="{$name}" value="{$value}" />
					<xsl:call-template name="search">
						<xsl:with-param name="raw" select="substring-after($raw,'&amp;')" />
					</xsl:call-template>
				</xsl:when>
				<xsl:otherwise>
					<xsl:variable name="name" select="substring-before($raw,'=')" />
					<xsl:variable name="value" select="substring-after($raw,'=')" />
					<parameter name="{$name}" value="{$value}" />
				</xsl:otherwise>
			</xsl:choose>
		</xsl:if>
	</xsl:template>
</xsl:stylesheet> 
