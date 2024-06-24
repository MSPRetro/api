const { movieModel } = require("../Utils/Schemas.js");
const { formatDate } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetMovieById",
	needTicket: false,
	levelModerator: 0
};

exports.run = async request => {
	const movie = await movieModel.findOne({ MovieId: request.movieId });
	if (!movie) return;

	return buildXML("GetMovieById", {
		MovieId: movie.MovieId,
		Name: movie.Name,
		ActorId: movie.ActorId,
		Guid: movie.Guid,
		State: movie.State,
		WatchedTotalCount: movie.ActorWatched.length,
		WatchedActorCount: movie.ActorWatched.length,
		RatedCount: movie.RatedCount,
		RatedTotalScore: movie.RatedTotalScore,
		CreatedDate: formatDate(movie.CreatedDate),
		PublishedDate: formatDate(movie.PublishedDate),
		AverageRating: movie.AverageRating,
		StarCoinsEarned: movie.StarCoinsEarned,
		MovieData: movie.MovieData,
		Complexity: movie.Complexity,
		CompetitionDate: formatDate(movie.CompetitionDate),
		ActorClothesData: movie.ActorClothesData,
		MovieActorRels: {
			MovieActorRel: movie.MovieActorRels
		},
		Scenes: movie.Scenes
	});

	/*
      <s:complexType name="ArrayOfMovieActorRel">
        <s:sequence>
            <s:element maxOccurs="unbounded" minOccurs="0" name="MovieActorRel" nillable="true" type="tns:MovieActorRel"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="MovieActorRel">
        <s:sequence>
            <s:element name="MovieActorRelId" type="s:int"/>
            <s:element name="MovieId" type="s:int"/>
            <s:element name="ActorId" type="s:int"/>
            <s:element name="FigureNumber" type="s:int"/>
            <s:element name="State" type="s:int"/>
        </s:sequence>
    </s:complexType>
  
  
    <s:complexType name="Movie">
        <s:sequence>
            <s:element name="MovieId" type="s:int"/>
            <s:element minOccurs="0" name="Name" type="s:string"/>
            <s:element name="ActorId" type="s:int"/>
            <s:element minOccurs="0" name="Guid" type="s:string"/>
            <s:element name="State" type="s:int"/>
            <s:element name="WatchedTotalCount" type="s:int"/>
            <s:element name="WatchedActorCount" type="s:int"/>
            <s:element name="RatedCount" type="s:int"/>
            <s:element name="RatedTotalScore" type="s:int"/>
            <s:element name="CreatedDate" type="s:dateTime"/>
            <s:element name="PublishedDate" type="s:dateTime"/>
            <s:element name="AverageRating" type="s:decimal"/>
            <s:element name="StarCoinsEarned" type="s:int"/>
            <s:element minOccurs="0" name="MovieData" type="s:base64Binary"/>
            <s:element name="Complexity" type="s:int"/>
            <s:element name="CompetitionDate" type="s:dateTime"/>
            <s:element minOccurs="0" name="ActorClothesData" type="s:base64Binary"/>
            <s:element minOccurs="0" name="MovieActorRels" type="tns:ArrayOfMovieActorRel"/>
            <s:element minOccurs="0" name="Scenes" type="tns:ArrayOfScene"/>
*/
};
