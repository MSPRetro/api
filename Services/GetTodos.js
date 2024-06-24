const { todoModel, userModel, movieModel } = require("../Utils/Schemas.js");
const { formatDate, addDays } = require("../Utils/Util.js");
const { buildXML } = require("../Utils/XML.js");

exports.data = {
	SOAPAction: "GetTodos",
	needTicket: true,
	levelModerator: 0
};

exports.run = async (request, ActorId) => {
	const user = await userModel.findOne({ ActorId: ActorId });
	const todos = await todoModel
		.find({ FriendId: ActorId })
		.sort({ _id: -1 })
		.skip(request.pageindex * 2)
		.limit(2);

	// formatDate(addDays(new Date(), -1))

	let todosArr = [];

	for (let todo of todos) {
		let TodoUser;
		let movie;

		switch (todo.Type) {
			case 0:
				// Submit movie

				movie = await movieModel.findOne({ MovieId: todo.MovieId });

				todosArr.push({
					TodoId: todo.TodoId,
					ActorId: ActorId,
					Deadline: formatDate(todo.Deadline),
					Type: 0,
					FriendId: 0,
					MovieId: todo.MovieId,
					ContestId: 0,
					MovieCompetitionId: 0,
					Priority: 0,
					GiftId: 0,
					Actor: {
						ActorId: user.ActorId,
						Name: user.Name
					},
					Friend: {},
					Movie: {
						MovieId: movie.MovieId,
						Name: movie.Name,
						Guid: movie.Guid
					},
					Contest: {},
					MovieCompetition: {}
				});

				break;
			case 1:
				// Vote for the competition
				break;
			case 2:
				// Rate a movie?
				break;
			case 3:
				// Friend request
				TodoUser = await userModel.findOne({ ActorId: todo.ActorId });

				todosArr.push({
					TodoId: todo.TodoId,
					ActorId: ActorId,
					Deadline: formatDate(todo.Deadline),
					Type: 3,
					FriendId: todo.ActorId,
					MovieId: 0,
					ContestId: 0,
					MovieCompetitionId: 0,
					Priority: 0,
					GiftId: 0,
					Actor: {
						ActorId: user.ActorId,
						Name: user.Name
					},
					Friend: {
						ActorId: TodoUser.ActorId,
						Name: TodoUser.Name
					},
					Movie: {},
					Contest: {},
					MovieCompetition: {}
				});

				break;
			case 4:
				// Receive starcoins when the user who is invited reaches level 3

				TodoUser = await userModel.findOne({ ActorId: todo.ActorId });

				todosArr.push({
					TodoId: todo.TodoId,
					ActorId: ActorId,
					Deadline: formatDate(todo.Deadline),
					Type: 4,
					FriendId: todo.ActorId,
					MovieId: 0,
					ContestId: 0,
					MovieCompetitionId: 0,
					Priority: 0,
					GiftId: 0,
					Actor: {
						ActorId: user.ActorId,
						Name: user.Name
					},
					Friend: {
						ActorId: TodoUser.ActorId,
						Name: TodoUser.Name
					},
					Movie: {},
					Contest: {},
					MovieCompetition: {}
				});

				break;
			case 5:
			case 6:
				// Boyfriend & Girlfriend request

				TodoUser = await userModel.findOne({ ActorId: todo.ActorId });

				let Type;
				if (user.Clinic.SkinSWF === "maleskin") Type = 5;
				else Type = 6;

				todosArr.push({
					TodoId: todo.TodoId,
					ActorId: ActorId,
					Deadline: formatDate(todo.Deadline),
					Type: Type,
					FriendId: todo.ActorId,
					MovieId: 0,
					ContestId: 0,
					MovieCompetitionId: 0,
					Priority: 0,
					GiftId: 0,
					Actor: {
						ActorId: user.ActorId,
						Name: user.Name
					},
					Friend: {
						ActorId: TodoUser.ActorId,
						Name: TodoUser.Name
					},
					Movie: {},
					Contest: {},
					MovieCompetition: {}
				});

				break;
			case 7:
				// Vote for a movie?
				break;
			case 8:
				// New gift
				TodoUser = await userModel.findOne({ ActorId: todo.ActorId });

				todosArr.push({
					TodoId: todo.TodoId,
					ActorId: ActorId,
					Deadline: formatDate(todo.Deadline),
					Type: 8,
					FriendId: todo.ActorId,
					MovieId: 0,
					ContestId: 0,
					MovieCompetitionId: 0,
					Priority: 0,
					GiftId: todo.GiftId,
					Actor: {
						ActorId: user.ActorId,
						Name: user.Name
					},
					Friend: {
						ActorId: TodoUser.ActorId,
						Name: TodoUser.Name
					},
					Movie: {},
					Contest: {},
					MovieCompetition: {}
				});

				break;
		}
	}

	return buildXML("GetTodos", {
		totalRecords: await todoModel.countDocuments({ FriendId: ActorId }),
		pageindex: request.pageindex,
		pagesize: 2,
		items: {
			Todo: todosArr
		}
	});
};

/*
        public static const TODO_SUBMITMOVIE:int = 0;
        public static const TODO_VOTE:int = 1;
        public static const TODO_SPEECH:int = 2;
        public static const TODO_FRIENDREQUEST:int = 3;
        public static const TODO_INVITATIONBONUS:int = 4;
        public static const TODO_BOYFRIENDREQUEST:int = 5;
        public static const TODO_GIRLFRIENDREQUEST:int = 6;
        public static const TODO_MOVIECOMPETITIONVOTEREQUEST:int = 7;
        public static const TODO_GIFT:int = 8;


    <s:complexType name="Todo">
        <s:sequence>
            <s:element name="TodoId" type="s:int"/>
            <s:element name="ActorId" type="s:int"/>
            <s:element name="Deadline" nillable="true" type="s:dateTime"/>
            <s:element name="Type" type="s:int"/>
            <s:element name="FriendId" nillable="true" type="s:int"/>
            <s:element name="MovieId" nillable="true" type="s:int"/>
            <s:element name="ContestId" nillable="true" type="s:int"/>
            <s:element name="MovieCompetitionId" nillable="true" type="s:int"/>
            <s:element name="Priority" type="s:int"/>
            <s:element name="GiftId" nillable="true" type="s:int"/>
            <s:element minOccurs="0" name="Actor" type="tns:TodoActor"/>
            <s:element minOccurs="0" name="Friend" type="tns:TodoActor"/>
            <s:element minOccurs="0" name="Movie" type="tns:TodoMovie"/>
            <s:element minOccurs="0" name="Contest" type="tns:TodoContest"/>
            <s:element minOccurs="0" name="MovieCompetition" type="tns:TodoMovieCompetition"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="TodoActor">
        <s:sequence>
            <s:element name="ActorId" type="s:int"/>
            <s:element minOccurs="0" name="Name" type="s:string"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="TodoMovie">
        <s:sequence>
            <s:element name="MovieId" type="s:int"/>
            <s:element minOccurs="0" name="Name" type="s:string"/>
            <s:element minOccurs="0" name="Guid" type="s:string"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="TodoContest">
        <s:sequence>
            <s:element name="ContestId" type="s:int"/>
            <s:element minOccurs="0" name="Name" type="s:string"/>
            <s:element minOccurs="0" name="Description" type="s:string"/>
            <s:element name="Status" type="s:int"/>
            <s:element name="OpeningTime" type="s:dateTime"/>
            <s:element name="ClosingTime" type="s:dateTime"/>
            <s:element name="VotingDeadline" type="s:dateTime"/>
            <s:element name="VotingRound" type="s:int"/>
            <s:element name="MaxNumberOfVotingRounds" type="s:int"/>
            <s:element name="PrizeMoney" type="s:int"/>
            <s:element minOccurs="0" name="SWFLarge" type="s:string"/>
            <s:element minOccurs="0" name="SWFList" type="s:string"/>
        </s:sequence>
    </s:complexType>
    <s:complexType name="TodoMovieCompetition">
        <s:sequence>
            <s:element name="MovieCompetitionId" type="s:int"/>
            <s:element minOccurs="0" name="Name" type="s:string"/>
            <s:element name="StartTime" type="s:dateTime"/>
            <s:element name="EndTime" type="s:dateTime"/>
            <s:element name="Status" type="s:int"/>
        </s:sequence>
    </s:complexType>
    */
