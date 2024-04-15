import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { useFleetbase, useMountedState } from 'hooks';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { tailwind } from 'tailwind';
import { SwipeListView } from 'react-native-swipe-list-view';
import { HelperUtil } from 'utils';

const ChatsScreen = () => {
    const navigation = useNavigation();
    const isMounted = useMountedState();
    const fleetbase = useFleetbase();
    const [channel, setChannel] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchChannels();
        });

        return unsubscribe;
    }, [isMounted]);

    const listenForOrdersFromSocket = (channelId, callback) => {
        HelperUtil.createSocketAndListen(`chat.${chatChannelRecord.public_id}`, socketEvent => {
            const { event, data } = socketEvent;
            switch (event) {
                case 'chat.added_participant':
                case 'chat.removed_participant':
                case 'chat_participant.created':
                case 'chat_participant.deleted':
                    this.channel.reloadParticipants();
                    this.loadAvailableUsers();
                    break;
                case 'chat_message.created':
                    this.chat.insertChatMessageFromSocket(this.channel, data);
                    break;
                case 'chat_log.created':
                    this.chat.insertChatLogFromSocket(this.channel, data);
                    break;
                case 'chat_attachment.created':
                    this.chat.insertChatAttachmentFromSocket(this.channel, data);
                    break;
                case 'chat_receipt.created':
                    this.chat.insertChatReceiptFromSocket(this.channel, data);
                    break;
            }
            this.handleChatFeedScroll();
        });
    };

    const fetchChannels = async () => {
        try {
            const adapter = fleetbase.getAdapter();
            const response = await adapter.get('chat-channels');
            setChannel(response);
            return response;
        } catch (error) {
            console.error('Error fetching channels:', error);
            return [];
        }
    };

    useEffect(() => {
        fetchChannels();
    }, []);

    const formatTime = dateTime => {
        const date = new Date(dateTime);
        const formattedTime = format(date, 'HH:mm');
        return formattedTime;
    };

    const handleDelete = async itemId => {
        try {
            const adapter = fleetbase.getAdapter();
            await adapter.delete(`chat-channels/${itemId}`);
            setChannel(channel.filter(item => item.id !== itemId));
        } catch (error) {
            console.error('Error deleting channel:', error);
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('ChatScreen')} style={tailwind('flex flex-row bg-gray-900 mt-2 p-2 rounded mx-2')}>
            <View style={tailwind('p-2')}>
                <FastImage
                    source={item.participants.avatar_url ? { uri: item.participants.avatar_url } : require('../../../../assets/icon.png')}
                    style={tailwind('w-10 h-10 rounded-full')}
                />
            </View>
            <View style={tailwind('flex ml-2')}>
                <Text style={tailwind('font-medium text-white')}>{item.name}</Text>
                <Text style={tailwind('text-sm text-gray-400 w-64')}>{item.message}</Text>
            </View>
            <View style={tailwind('flex flex-col items-center right-2')}>
                <Text style={tailwind('text-gray-600')}>{formatTime(item.created_at)}</Text>
            </View>
        </TouchableOpacity>
    );

    const renderHiddenItem = ({ item }) => (
        <View style={tailwind('bg-white w-full h-full p-2')}>
            <TouchableOpacity onPress={() => handleDelete(item.id)} style={tailwind('flex items-center w-20 bg-red-600')}>
                <Text style={tailwind('text-white font-semibold')}>Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={tailwind('w-full h-full bg-gray-800')}>
            <SwipeListView data={channel} renderItem={renderItem} renderHiddenItem={renderHiddenItem} rightOpenValue={-75} />
            <View style={tailwind('p-4')}>
                <View style={tailwind('flex flex-row items-center justify-center')}>
                    <TouchableOpacity style={tailwind('flex-1')} onPress={() => navigation.navigate('ChannelScreen')}>
                        <View style={tailwind('btn bg-gray-900 border border-gray-700')}>
                            <Text style={tailwind('font-semibold text-gray-50 text-base')}>Create Channel</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default ChatsScreen;
