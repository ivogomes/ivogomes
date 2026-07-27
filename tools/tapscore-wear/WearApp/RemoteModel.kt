package com.ivogomes.tapscore.wear

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.google.android.gms.wearable.MessageClient
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.Wearable
import org.json.JSONObject

// "Remote" mode: the watch controls the match on the phone. Sends score/undo/sync over the Wearable
// Data Layer and mirrors the state the phone broadcasts. The phone stays the source of truth.
class RemoteModel(context: Context) : MessageClient.OnMessageReceivedListener {
    private val app = context.applicationContext
    private val msg = Wearable.getMessageClient(app)
    private val nodes = Wearable.getNodeClient(app)
    private val haptics = Haptics(context)
    private val path = "/tapscore"

    var reachable by mutableStateOf(false); private set
    var active by mutableStateOf(false); private set
    var over by mutableStateOf(false); private set
    var winner by mutableStateOf(-1); private set
    var you by mutableStateOf("0"); private set
    var opp by mutableStateOf("0"); private set
    var pill by mutableStateOf(""); private set
    var server by mutableStateOf(0); private set
    var names by mutableStateOf(listOf("You", "Opp")); private set

    fun start() { msg.addListener(this); requestSync() }
    fun stop() { try { msg.removeListener(this) } catch (e: Exception) {} }

    private fun sendCmd(json: String) {
        nodes.connectedNodes
            .addOnSuccessListener { list -> reachable = list.isNotEmpty(); for (n in list) msg.sendMessage(n.id, path, json.toByteArray()) }
            .addOnFailureListener { reachable = false }
    }
    fun score(side: Int) { haptics.point(); sendCmd("""{"t":"score","side":$side}""") }
    fun undo() { haptics.undo(); sendCmd("""{"t":"undo"}""") }
    fun requestSync() { sendCmd("""{"t":"sync"}""") }

    override fun onMessageReceived(e: MessageEvent) {
        if (e.path != path) return
        try {
            val o = JSONObject(String(e.data))
            reachable = true
            active = o.optBoolean("active"); over = o.optBoolean("over"); winner = o.optInt("winner", -1)
            you = o.optString("you", "0"); opp = o.optString("opp", "0"); pill = o.optString("pill", "")
            server = o.optInt("server", 0)
            o.optJSONArray("names")?.let { if (it.length() == 2) names = listOf(it.getString(0), it.getString(1)) }
        } catch (ex: Exception) {}
    }
}
