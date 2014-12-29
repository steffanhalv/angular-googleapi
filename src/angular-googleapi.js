angular.module('googleApi', [])
	.value('version', '0.1')

    .service("googleApiBuilder", function($q) {
        this.loadClientCallbacks = [];

        this.build = function(requestBuilder, responseTransformer) {
            return function(args) {
                var deferred = $q.defer();
                var response;
                request = requestBuilder(args);
                request.execute(function(resp, raw) {
                    if(resp.error) {
                        deferred.reject(resp.error);
                    } else {
                        response = responseTransformer ? responseTransformer(resp) : resp;
                        deferred.resolve(response);
                    }

                });
                return deferred.promise;

            }
        };

        this.afterClientLoaded = function(callback) {
            this.loadClientCallbacks.push(callback);
        };

        this.runClientLoadedCallbacks = function() {
            for(var i=0; i < this.loadClientCallbacks.length; i++) {
                this.loadClientCallbacks[i]();
            }
        };
    })

    .provider('googleLogin', function() {

        this.configure = function(conf) {
            this.config = conf;
        };

        this.$get = function ($q, googleApiBuilder, $rootScope) {
            var config = this.config;
            var deferred = $q.defer();
            return {
                login: function () {
                    gapi.auth.authorize({ client_id: config.clientId, scope: config.scopes, immediate: false }, this.handleAuthResult);

                    return deferred.promise;
                },

                handleClientLoad: function (token) {
                    // gapi.auth.init(function () {
                    //     console.log('test')
                    // });
                    if(token) {
                        gapi.auth.setToken(token);
                    }
                    gapi.client.setApiKey(config.apiKey);
                    this.checkAuth()

                },

                checkAuth: function() {
                    gapi.auth.authorize({ client_id: config.clientId, scope: config.scopes, immediate: true }, this.handleAuthResult );
                },

                handleAuthResult: function(authResult) {
                    if (authResult && !authResult.error) {
                        var data = {};
                        $rootScope.$broadcast("google:authenticated", authResult);
                        googleApiBuilder.runClientLoadedCallbacks();
                        deferred.resolve(authResult);
                    } else {
                        deferred.reject(authResult.error);
                    }
                },
            }
        };


    })

    .service("googleCalendar", function(googleApiBuilder, $rootScope) {

        var self = this;
        var events = [];
        var itemExtractor = function(resp) { return resp.items; };

        var getAllEvents = function(resp) {
            events = events.concat(itemExtractor(resp));
            if (resp.nextPageToken) {
                self.listEvents({
                    calendarId: self.calendarId,
                    pageToken: resp.nextPageToken
                });
            }

            return events;
        }

        var getEvents = function(args) {
            self.calendarId = args.calendarId;
            return googleApiBuilder.build(gapi.client.calendar.events.list, getAllEvents)(args);
        }
        googleApiBuilder.afterClientLoaded(function() {
            gapi.client.load('calendar', 'v3', function() {

                self.listEvents = googleApiBuilder.build(gapi.client.calendar.events.list);
                self.listCalendars = googleApiBuilder.build(gapi.client.calendar.calendarList.list, itemExtractor);
                self.createEvent = googleApiBuilder.build(gapi.client.calendar.events.insert);
                self.updateEvent = googleApiBuilder.build(gapi.client.calendar.events.update);
                self.removeEvent = googleApiBuilder.build(gapi.client.calendar.events.delete);
                self.loaded = true
                $rootScope.$broadcast("googleCalendar:loaded")
            });

        });


    })

    .service("googleMail", function(googleApiBuilder, $rootScope) {

        var self = this;
        var itemExtractor = function(resp) { return resp; };
        var processMessage = function(email) {
            // TODO: get email text, html, attachments etc.
            return email;
        };

        googleApiBuilder.afterClientLoaded(function() {
            gapi.client.load('gmail', 'v1', function() {

                self.listThreads = googleApiBuilder.build(gapi.client.gmail.users.threads.list);
                self.getThread = googleApiBuilder.build(gapi.client.gmail.users.threads.get);

                self.listMessages = googleApiBuilder.build(gapi.client.gmail.users.messages.list);
                self.getMessage = googleApiBuilder.build(gapi.client.gmail.users.messages.get, processMessage);
                // self.listCalendars = googleApiBuilder.build(gapi.client.calendar.calendarList.list, itemExtractor);
                // self.createEvent = googleApiBuilder.build(gapi.client.calendar.events.insert);



                // self.draftsCreate = googleApiBuilder.build(gapi.client.gmail.users.drafts.create)
                // self.draftsDelete = googleApiBuilder.build(gapi.client.gmail.users.drafts.delete)
                // self.draftsGet = googleApiBuilder.build(gapi.client.gmail.users.drafts.get)
                // self.draftsList = googleApiBuilder.build(gapi.client.gmail.users.drafts.list)
                // self.draftsSend = googleApiBuilder.build(gapi.client.gmail.users.drafts.send)
                // self.draftsUpdate = googleApiBuilder.build(gapi.client.gmail.users.drafts.update)
                // self.historyList = googleApiBuilder.build(gapi.client.gmail.users.history.list)
                // self.labelsCreate = googleApiBuilder.build(gapi.client.gmail.users.labels.create)
                self.labelsDelete = googleApiBuilder.build(gapi.client.gmail.users.labels.delete)
                self.labelsGet = googleApiBuilder.build(gapi.client.gmail.users.labels.get)
                self.labelsList = googleApiBuilder.build(gapi.client.gmail.users.labels.list)
                // self.labelsPatch = googleApiBuilder.build(gapi.client.gmail.users.labels.patch)
                self.labelsUpdate = googleApiBuilder.build(gapi.client.gmail.users.labels.update)
                // self.messagesDelete = googleApiBuilder.build(gapi.client.gmail.users.messages.delete)
                self.messagesGet = googleApiBuilder.build(gapi.client.gmail.users.messages.get)
                // self.messagesImport = googleApiBuilder.build(gapi.client.gmail.users.messages.import)
                // self.messagesInsert = googleApiBuilder.build(gapi.client.gmail.users.messages.insert)
                self.messagesList = googleApiBuilder.build(gapi.client.gmail.users.messages.list)
                self.messagesModify = googleApiBuilder.build(gapi.client.gmail.users.messages.modify)
                // self.messagesSend = googleApiBuilder.build(gapi.client.gmail.users.messages.send)
                self.messagesTrash = googleApiBuilder.build(gapi.client.gmail.users.messages.trash)
                self.messagesUntrash = googleApiBuilder.build(gapi.client.gmail.users.messages.untrash)
                self.messagesAttachments = googleApiBuilder.build(gapi.client.gmail.users.messages.attachments)
                // self.threadsDelete = googleApiBuilder.build(gapi.client.gmail.users.threads.delete)
                // self.threadsGet = googleApiBuilder.build(gapi.client.gmail.users.threads.get)
                // self.threadsList = googleApiBuilder.build(gapi.client.gmail.users.threads.list)
                // self.threadsModify = googleApiBuilder.build(gapi.client.gmail.users.threads.modify)
                // self.threadsTrash = googleApiBuilder.build(gapi.client.gmail.users.threads.trash)
                // self.threadsUntrash = googleApiBuilder.build(gapi.client.gmail.users.threads.untrash)


                self.loaded = true;
                $rootScope.$broadcast("googleMail:loaded")
            });

        });

    })

    .service("youtube", function(googleApiBuilder, $rootScope) {
            var self = this;
            var itemExtractor = function(resp) { return resp.items; };


            googleApiBuilder.afterClientLoaded(function() {
                    gapi.client.load('youtube', 'v3', function() {

                        self.activitiesInsert = googleApiBuilder.build(gapi.client.youtube.activities.insert)
                        self.activitiesList = googleApiBuilder.build(gapi.client.youtube.activities.list)
                        self.channelBannersInsert = googleApiBuilder.build(gapi.client.youtube.channelBanners.insert)
                        self.channelSectionsDelete = googleApiBuilder.build(gapi.client.youtube.channelSections.delete)
                        self.channelSectionsInsert = googleApiBuilder.build(gapi.client.youtube.channelSections.insert)
                        self.channelSectionsList = googleApiBuilder.build(gapi.client.youtube.channelSections.list)
                        self.channelSectionsUpdate = googleApiBuilder.build(gapi.client.youtube.channelSections.update)
                        self.channelsList = googleApiBuilder.build(gapi.client.youtube.channels.list, itemExtractor)
                        self.channelsUpdate = googleApiBuilder.build(gapi.client.youtube.channels.update)
                        self.guideCategoriesList = googleApiBuilder.build(gapi.client.youtube.guideCategories.list)
                        self.i18nLanguagesList = googleApiBuilder.build(gapi.client.youtube.i18nLanguages.list)
                        self.i18nRegionsList = googleApiBuilder.build(gapi.client.youtube.i18nRegions.list)
                        self.liveBroadcastsBindcan = googleApiBuilder.build(gapi.client.youtube.liveBroadcasts.bindcan)
                        self.liveBroadcastsControl = googleApiBuilder.build(gapi.client.youtube.liveBroadcasts.control)
                        self.liveBroadcastsDelete = googleApiBuilder.build(gapi.client.youtube.liveBroadcasts.delete)
                        self.liveBroadcastsInsert = googleApiBuilder.build(gapi.client.youtube.liveBroadcasts.insert)
                        self.liveBroadcastsList = googleApiBuilder.build(gapi.client.youtube.liveBroadcasts.list)
                        self.liveBroadcastsTransition = googleApiBuilder.build(gapi.client.youtube.liveBroadcasts.transition)
                        self.liveBroadcastsUpdatecontentDetails = googleApiBuilder.build(gapi.client.youtube.liveBroadcasts.updatecontentDetails)
                        self.liveStreamsDelete = googleApiBuilder.build(gapi.client.youtube.liveStreams.delete)
                        self.liveStreamsInsert  = googleApiBuilder.build(gapi.client.youtube.liveStreams.insert )
                        self.liveStreamsList = googleApiBuilder.build(gapi.client.youtube.liveStreams.list)
                        self.liveStreamsUpdatestream  = googleApiBuilder.build(gapi.client.youtube.liveStreams.updatestream )
                        self.playlistItemsDelete = googleApiBuilder.build(gapi.client.youtube.playlistItems.delete)
                        self.playlistItemsInsert = googleApiBuilder.build(gapi.client.youtube.playlistItems.insert)
                        self.playlistItemsList = googleApiBuilder.build(gapi.client.youtube.playlistItems.list, itemExtractor)
                        self.playlistItemsUpdate = googleApiBuilder.build(gapi.client.youtube.playlistItems.update)
                        self.playlistsDelete = googleApiBuilder.build(gapi.client.youtube.playlists.delete)
                        self.playlistsInsert = googleApiBuilder.build(gapi.client.youtube.playlists.insert)
                        self.playlistsList = googleApiBuilder.build(gapi.client.youtube.playlists.list, itemExtractor)
                        self.playlistsUpdate = googleApiBuilder.build(gapi.client.youtube.playlists.update)
                        self.searchList = googleApiBuilder.build(gapi.client.youtube.search.list, itemExtractor)
                        self.subscriptionsDelete = googleApiBuilder.build(gapi.client.youtube.subscriptions.delete)
                        self.subscriptionsInsert = googleApiBuilder.build(gapi.client.youtube.subscriptions.insert)
                        self.subscriptionsList = googleApiBuilder.build(gapi.client.youtube.subscriptions.list)
                        self.thumbnailsSet = googleApiBuilder.build(gapi.client.youtube.thumbnails.set)
                        self.videoCategoriesList = googleApiBuilder.build(gapi.client.youtube.videoCategories.list)
                        self.videosDelete = googleApiBuilder.build(gapi.client.youtube.videos.delete)
                        self.videosGetRating = googleApiBuilder.build(gapi.client.youtube.videos.getRating)
                        self.videosInsert = googleApiBuilder.build(gapi.client.youtube.videos.insert)
                        self.videosList = googleApiBuilder.build(gapi.client.youtube.videos.list)
                        self.videosRate = googleApiBuilder.build(gapi.client.youtube.videos.rate)
                        self.videosUpdate = googleApiBuilder.build(gapi.client.youtube.videos.update)
                        self.watermarksSet = googleApiBuilder.build(gapi.client.youtube.watermarks.set)
                        self.watermarksUnset = googleApiBuilder.build(gapi.client.youtube.watermarks.unset)

                        self.loaded = true
                        $rootScope.$broadcast("youtube:loaded")
                    });

            });

    })

    .service("googleTasks", function(googleApiBuilder, $rootScope) {

            var self = this;
            var itemExtractor = function(resp) { return resp.items; };

            googleApiBuilder.afterClientLoaded(function() {
                    gapi.client.load('tasks', 'v1', function() {
                        self.deleteList = googleApiBuilder.build(gapi.client.tasks.tasklists.delete);
                        self.getList = googleApiBuilder.build(gapi.client.tasks.tasklists.get);
                        self.insertList = googleApiBuilder.build(gapi.client.tasks.tasklists.insert);
                        self.listList = googleApiBuilder.build(gapi.client.tasks.tasklists.list);
                        self.patchList = googleApiBuilder.build(gapi.client.tasks.tasklists.patch);
                        self.updateList = googleApiBuilder.build(gapi.client.tasks.tasklists.update);

                        self.clear = googleApiBuilder.build(gapi.client.tasks.tasks.clear);
                        self.delete = googleApiBuilder.build(gapi.client.tasks.tasks.delete);
                        self.get = googleApiBuilder.build(gapi.client.tasks.tasks.get);
                        self.insert = googleApiBuilder.build(gapi.client.tasks.tasks.insert);
                        self.list = googleApiBuilder.build(gapi.client.tasks.tasks.list);
                        self.move = googleApiBuilder.build(gapi.client.tasks.tasks.move);
                        self.patch = googleApiBuilder.build(gapi.client.tasks.tasks.patch);
                        self.update = googleApiBuilder.build(gapi.client.tasks.tasks.update);
                        self.loaded = true

                        $rootScope.$broadcast("googleTasks:loaded")
                    });

            });

    })

	.service("googlePlus", function(googleApiBuilder, $rootScope) {

			var self = this;
			var itemExtractor = function(resp) { return resp.items; };

			googleApiBuilder.afterClientLoaded(function() {
					gapi.client.load('plus', 'v1', function() {
						self.getPeople = googleApiBuilder.build(gapi.client.plus.people.get);
						self.getCurrentUser = function() {
							return self.getPeople({userId: "me"});
						}
						$rootScope.$broadcast("googlePlus:loaded")
					});

			});

	})
