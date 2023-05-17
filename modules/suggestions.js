function updateTags(channel, addTags = [], removeTags = []){
    let updatedTags = channel.appliedTags;
    addTags.forEach(addTag =>{
        if (!channel.appliedTags.includes(addTag)){
            updatedTags.push(addTag);
        }
    })
    removeTags.forEach(removeTag =>{
        updatedTags = updatedTags.filter(i => i !== removeTag);
    })

    channel.setAppliedTags(updatedTags);
}

function findTagsInForumByName(forum, tags = []){
    let forumAvailableTags = forum.availableTags;
    let results = [];

    forumAvailableTags.forEach( forumTag =>{
        tags.forEach( tag => {
            // check if the name of the tag in the forum matches the name of the given tag
            if (forumTag.name === tag)
                results.push(forumTag);
        });
    });

    return results;
}

function threadChannelHasTags(channel, tags){

    console.log("Amount of blocked tags: " + tags.length); //DEBUG
    for (let tag in tags){
        console.log("iterating..."); //DEBUG
        if (channel.appliedTags.includes(tag.id))
            return true;
    }
    // tags.forEach( tag =>{
    //     console.log("Channel tags: " + channel.appliedTags + " | " + "Current iteration: " + tag.id + " (" + tag.name + ")") //DEBUG
    //     // check if the channel has the tag applied to it
    //     if (channel.appliedTags.includes(tag.id))
    //         console.log("Found blocked tag"); //DEBUG
    //     if (channel.appliedTags.includes(tag.id))
    //         return true;
    // });

    console.log("Did not find any blocked tags"); //DEBUG
    return false;
}

exports.test = (client, Events) => {
    client.on(Events.MessageCreate, msg =>{
        // check if message was sent by the bot
        if (msg.author.id === client.user.id) return;

        // check if message is a thread
        if (!msg.channel.isThread()) return;

        let threadChannel = msg.channel;

        const FORUM_CHANNEL_TYPE_ENUM = 15;

        // check if thread channel is part of a forum
        if (threadChannel.parent.type !== FORUM_CHANNEL_TYPE_ENUM) return;

        let tagsToApply = ["Awaiting Response"]; // tags that will be applied when the message is created
        let ignoreMessagesWithTags = ["Approved", "Denied", "Implemented"]; // if thread has any of these tags, ignore this event

        let forumChannel = threadChannel.parent;

        let tagsToApplyById = findTagsInForumByName(forumChannel, tagsToApply);
        let ignoreMessagesWithTagsById = findTagsInForumByName(forumChannel, ignoreMessagesWithTags);

        // check if thread channel needs to apply any tags
        if (!tagsToApply.length)
            return;

        // check if thread channel has any tags from ignoreMessagesWithTagsById
        if (threadChannelHasTags(threadChannel, ignoreMessagesWithTagsById))
            return;

        let applyTags = [];

        tagsToApplyById.forEach( tag =>{
            // check if thread channel has tags from tagsToApplyById
            if (!threadChannel.appliedTags.includes(tag.id))
                applyTags.push(tag.id);
        });

        // check if channel will have any tags applied to it
        if (!applyTags.length)
            return;

        updateTags(threadChannel, applyTags);
    })
} 

exports.newSuggestion = (client, Events) => {
    client.on(Events.MessageCreate, msg =>{
        if (msg.author.id === client.user.id) return;
        if (!msg.channel.isThread()) return;

        let tagsToApply = ["Awaiting Response"];
        let blockTags = ["Approved", "Denied", "Implemented"];
        let channel = msg.channel;
        let threadTags = channel.appliedTags;
        let forumTags = channel.parent.availableTags;
        
        // Checks if forum has the tags tagsToApply[]
        let foundForumTags = [];
        let foundForumBlockTags = [];
        forumTags.forEach(forumTag => {
            tagsToApply.forEach(tagToApply =>{
                if (forumTag.name === tagToApply) foundForumTags.push(forumTag.id);
            })
            blockTags.forEach(blockTag =>{
                if (forumTag.name === blockTag) foundForumBlockTags.push(forumTag.id);
            })
        })
        if (!foundForumTags.length || !foundForumBlockTags) return;
        
        // Checks if thread has the tags in foundForumTags[] AND if thread doesn't have tags in blockTags[]
        let applyTags = [];
        foundForumTags.forEach(foundForumTag =>{
            foundForumBlockTags.forEach(foundForumBlockTag =>{
                if (!threadTags.includes(foundForumTag) && !threadTags.includes(foundForumBlockTag)){
                    applyTags.push(foundForumTag);
                }
            })
        })
        
        updateTags(channel, applyTags);
    })
}

exports.resolveSuggestion = (client, Events) =>{
    client.on(Events.ThreadUpdate, (oldChannel, newChannel) =>{
        addedTags = newChannel.appliedTags.filter(n => !oldChannel.appliedTags.includes(n));
        if (!addedTags.length) return;

        // Get audit log, specifically last user who edited a forum thread
        newChannel.guild.fetchAuditLogs({ type: 111, limit: 1 }).then((audit) =>{
            let user = audit.entries.first().executor.id;

            // Define tag maps
            let forumTagsByName = new Map();
            let forumTagsById = new Map();
            newChannel.parent.availableTags.forEach(availableTag =>{
                forumTagsByName.set(availableTag.name, availableTag.id);
                forumTagsById.set(availableTag.id, availableTag.name);
            });

            // Set message and remove tags depending on which tags were added
            let message = "";
            let removeTags = [];
            let error;
            addedTags.forEach(addedTag =>{
                switch (forumTagsById.get(addedTag)){
                    case "Approved":
                        message = "approved";
                        break;
                    case "Denied":
                        message = "denied";
                        break;
                    case "Implemented":
                        message = "implemented";
                        if (newChannel.appliedTags.includes(forumTagsByName.get("Approved"))) removeTags.push(forumTagsByName.get("Approved"));
                        if (newChannel.appliedTags.includes(forumTagsByName.get("Denied"))) removeTags.push(forumTagsByName.get("Denied"));
                        break;
                    default:
                        error = true;
                        break;
                }
            })
            if (error === true) return;
            removeTags.push(forumTagsByName.get("Awaiting Response"));
            
            // Remove tags
            updateTags(newChannel, [], removeTags);

            // Send message and close post
            newChannel.fetchOwner().then((owner) =>{
                newChannel.send(`Hello <@${owner.id}>! This suggestion has been ${message} by <@${user}>! If you have any questions regarding the decision, please contact <@${user}>. This post has been locked and closed.`).then(() => {
                    newChannel.setLocked(true);
                    newChannel.setArchived(true);
                });
            });
        });
    })
}