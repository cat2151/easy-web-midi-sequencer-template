function midifilter(data) {
    console.log(`midifilter : before : `, data);
    const events = data[0];
    const event0 = events[0];

    // TODO XXX リファクタリングする
    const event1 = new Uint8Array(event0);
    event1[1] += 4;
    events.push(event1);

    const event2 = new Uint8Array(event0);
    event2[1] += 7;
    events.push(event2);

    console.log(`midifilter : after : `, data);
    return data;
}

export { midifilter };
