using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace server
{
    public class ChatHub : Hub
    {
        public async void SendMessage(string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        public async Task<DateTime> GetServerDateTime()
        {
            return await Task.Run(()=> { return DateTime.Now; });
        }

        public override Task OnConnectedAsync()
        {
            var nickName = Context.ConnectionId.Substring(Context.ConnectionId.Length - 6);
            var message = $"Client {nickName} connected";
            Console.WriteLine(message);            
            //Clients.All.SendAsync("ClientConnected", message);  //Notify all connected clients
            Clients.AllExcept(Context.ConnectionId).SendAsync("ClientConnected", message, nickName);
            return Task.CompletedTask;
        }
        public override Task OnDisconnectedAsync(Exception ex)
        {
            var nickName = Context.ConnectionId.Substring(Context.ConnectionId.Length - 6);
            var message = $"Client {nickName} disconnected";
            Console.WriteLine(message);            
            Clients.All.SendAsync("ClientDisconnected", message);  //Notify all connected clients
            //return Clients.AllExcept(Context.ConnectionId).SendAsync("ClientDisconnected", message);
            return Task.CompletedTask;
        }
    }
}
